import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CenteredLoading } from '@seafile/sf-metadata-ui-component';
import Content from './content';
import ImageDialog from '../../../components/dialog/image-dialog';
import ModalPortal from '../../../components/modal-portal';
import { useMetadataView } from '../../hooks/metadata-view';
import { Utils } from '../../../utils/utils';
import { getDateDisplayString, getFileNameFromRecord, getParentDirFromRecord, getRecordIdFromRecord } from '../../utils/cell';
import { siteRoot, fileServerRoot, thumbnailSizeForGrid, thumbnailSizeForOriginal } from '../../../utils/constants';
import { EVENT_BUS_TYPE, GALLERY_DATE_MODE, DATE_TAG_HEIGHT, STORAGE_GALLERY_DATE_MODE_KEY, STORAGE_GALLERY_ZOOM_GEAR_KEY } from '../../constants';
import { getRowById } from '../../utils/table';
import { getEventClassName } from '../../utils/common';
import GalleryContextmenu from './context-menu';
import { getColumns, getImageSize, getRowHeight } from './utils';
import ObjectUtils from '../../utils/object-utils';

import './index.css';

const OVER_SCAN_ROWS = 20;

const Main = ({ isLoadingMore, metadata, onDelete, onLoadMore, duplicateRecord, onAddFolder, onRemoveImage }) => {
  const [isFirstLoading, setFirstLoading] = useState(true);
  const [zoomGear, setZoomGear] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [overScan, setOverScan] = useState({ top: 0, bottom: 0 });
  const [mode, setMode] = useState(GALLERY_DATE_MODE.YEAR);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);

  const containerRef = useRef(null);
  const scrollContainer = useRef(null);
  const lastState = useRef({ visibleAreaFirstImage: { groupIndex: 0, rowIndex: 0 } });

  const { repoID, updateCurrentDirent } = useMetadataView();

  const images = useMemo(() => {
    if (isFirstLoading) return [];
    if (!Array.isArray(metadata.rows) || metadata.rows.length === 0) return [];
    const firstSort = metadata.view.sorts[0];
    return metadata.rows
      .filter(record => Utils.imageCheck(getFileNameFromRecord(record)))
      .map(record => {
        const id = getRecordIdFromRecord(record);
        const fileName = getFileNameFromRecord(record);
        const parentDir = getParentDirFromRecord(record);
        const size = mode === GALLERY_DATE_MODE.YEAR ? thumbnailSizeForOriginal : thumbnailSizeForGrid;
        const path = Utils.encodePath(Utils.joinPath(parentDir, fileName));
        const date = getDateDisplayString(record[firstSort.column_key], 'YYYY-MM-DD');
        const year = date.slice(0, 4);
        const month = date.slice(0, -3);
        const day = date.slice(-2,);
        return {
          id,
          name: fileName,
          parentDir,
          url: `${siteRoot}lib/${repoID}/file${path}`,
          src: `${siteRoot}thumbnail/${repoID}/${size}${path}`,
          thumbnail: `${siteRoot}thumbnail/${repoID}/${thumbnailSizeForOriginal}${path}`,
          downloadURL: `${fileServerRoot}repos/${repoID}/files${path}?op=download`,
          year,
          month,
          day,
          date,
        };
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstLoading, repoID, metadata, metadata.recordsCount]);
  const columns = useMemo(() => getColumns(mode, zoomGear), [mode, zoomGear]);
  const imageSize = useMemo(() => getImageSize(containerWidth, columns, mode), [containerWidth, columns, mode]);
  const rowHeight = useMemo(() => getRowHeight(imageSize, mode), [mode, imageSize]);
  const groups = useMemo(() => {
    let init = images
      .reduce((_init, image) => {
        let name = '';
        if (mode === GALLERY_DATE_MODE.YEAR) name = image.year;
        if (mode === GALLERY_DATE_MODE.MONTH) name = image.month;
        if (mode === GALLERY_DATE_MODE.DAY) name = image.date;
        let _group = _init.find(g => g.name === name);
        if (_group) {
          _group.children.push(image);
        } else {
          _init.push({
            name,
            children: [image],
          });
        }
        return _init;
      }, []);

    let _groups = [];
    const paddingTop = mode === GALLERY_DATE_MODE.ALL ? 0 : DATE_TAG_HEIGHT;
    init.forEach((_init, index) => {
      const { children, ...__init } = _init;
      let top = 0;
      let rows = [];
      if (index > 0) {
        const lastGroup = _groups[index - 1];
        const { top: lastGroupTop, height: lastGroupHeight } = lastGroup;
        top = lastGroupTop + lastGroupHeight;
      }
      children.forEach((child, childIndex) => {
        const rowIndex = ~~(childIndex / columns);
        if (!rows[rowIndex]) rows[rowIndex] = { top: paddingTop + top + rowIndex * rowHeight, children: [] };
        child.groupIndex = index;
        child.rowIndex = rowIndex;
        rows[rowIndex].children.push(child);
      });

      if (mode === GALLERY_DATE_MODE.YEAR) rows = rows.slice(0, 1);
      if (mode === GALLERY_DATE_MODE.MONTH) rows = rows.slice(0, 1);
      if (mode === GALLERY_DATE_MODE.DAY) rows = [{ top: rows[0].top, children: rows.slice(0, 2).flatMap(r => r.children) }];
      _groups.push({
        ...__init,
        top,
        height: rows.length * rowHeight + paddingTop,
        paddingTop,
        children: rows
      });
    });
    return _groups;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFirstLoading, images, repoID, columns, mode, containerWidth]);
  const containerHeight = useMemo(() => {
    return groups.reduce((cur, g) => cur + g.height, 0);
  }, [groups]);

  const handleScroll = useCallback(() => {
    if (!scrollContainer.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.current;

    if (scrollTop + clientHeight >= scrollHeight - 10) {
      onLoadMore && onLoadMore();
    }

    let groupIndex = 0;
    let rowIndex = 0;
    let flag = false;
    for (let i = 0; i < groups.length; i++) {
      const group = groups[i];
      for (let j = 0; j < group.children.length; j++) {
        const row = group.children[j];
        if (row.top >= scrollTop) {
          groupIndex = i;
          rowIndex = j;
          flag = true;
          break;
        }
      }
      if (flag) break;
    }
    lastState.current = { ...lastState.current, visibleAreaFirstImage: { groupIndex, rowIndex } };

    const newOverScan = {
      top: Math.max(0, scrollTop - rowHeight * OVER_SCAN_ROWS),
      bottom: scrollTop + clientHeight + rowHeight * OVER_SCAN_ROWS
    };
    setOverScan(newOverScan);
  }, [rowHeight, onLoadMore, groups]);

  const updateSelectedImage = useCallback((image = null) => {
    const imageInfo = image ? getRowById(metadata, image.id) : null;
    if (!imageInfo) {
      updateCurrentDirent();
      return;
    }
    updateCurrentDirent({
      id: image.id,
      type: 'file',
      name: image.name,
      path: image.parentDir,
      file_tags: []
    });
  }, [metadata, updateCurrentDirent]);

  const handleClick = useCallback((event, image) => {
    if (event.metaKey || event.ctrlKey) {
      setSelectedImages(prev =>
        prev.includes(image) ? prev.filter(img => img !== image) : [...prev, image]
      );
      updateSelectedImage(image);
      return;
    }
    if (event.shiftKey && selectedImages.length > 0) {
      const lastSelected = selectedImages[selectedImages.length - 1];
      const start = images.findIndex(image => image.id === lastSelected.id);
      const end = images.findIndex(image => image.id === lastSelected.id);
      const range = images.slice(Math.min(start, end), Math.max(start, end) + 1);
      setSelectedImages(prev => Array.from(new Set([...prev, ...range])));
      updateSelectedImage(null);
      return;
    }
    setSelectedImages([image]);
    updateSelectedImage(image);
  }, [images, selectedImages, updateSelectedImage]);

  const handleDoubleClick = useCallback((event, image) => {
    event.preventDefault();
    const index = images.findIndex(item => item.id === image.id);
    setImageIndex(index);
    setIsImagePopupOpen(true);
  }, [images]);

  const handleContextMenu = useCallback((event, image) => {
    event.preventDefault();
    const index = images.findIndex(item => item.id === image.id);
    if (isNaN(index) || index === -1) return;

    setSelectedImages(prev => prev.length < 2 ? [image] : [...prev]);
  }, [images]);

  const moveToPrevImage = useCallback(() => {
    const imageItemsLength = images.length;
    const selectedImage = images[(imageIndex + imageItemsLength - 1) % imageItemsLength];
    setImageIndex((prevState) => (prevState + imageItemsLength - 1) % imageItemsLength);
    setSelectedImages([selectedImage]);
    updateSelectedImage(selectedImage);
  }, [images, imageIndex, updateSelectedImage]);

  const moveToNextImage = useCallback(() => {
    const imageItemsLength = images.length;
    const selectedImage = images[(imageIndex + 1) % imageItemsLength];
    setImageIndex((prevState) => (prevState + 1) % imageItemsLength);
    setSelectedImages([selectedImage]);
    updateSelectedImage(selectedImage);
  }, [images, imageIndex, updateSelectedImage]);

  const handleImageSelection = useCallback((selectedImages) => {
    setSelectedImages(selectedImages);
  }, []);

  const closeImagePopup = useCallback(() => {
    setIsImagePopupOpen(false);
  }, []);

  const handleDeleteSelectedImages = useCallback((selectedImages) => {
    if (!selectedImages.length) return;
    onDelete(selectedImages, {
      success_callback: () => {
        updateCurrentDirent();
        setSelectedImages([]);
      }
    });
  }, [onDelete, updateCurrentDirent]);

  const handelRemoveSelectedImages = useCallback((selectedImages) => {
    if (!selectedImages.length) return;
    onRemoveImage(selectedImages, () => {
      updateCurrentDirent();
      setSelectedImages([]);
    });
  }, [onRemoveImage, updateCurrentDirent]);

  const handleClickOutside = useCallback((event) => {
    const className = getEventClassName(event);
    const isClickInsideImage = className.includes('metadata-gallery-image-item') || className.includes('metadata-gallery-grid-image');

    if (!isClickInsideImage && containerRef.current.contains(event.target)) {
      handleImageSelection([]);
      updateSelectedImage();
    }
  }, [handleImageSelection, updateSelectedImage]);

  const deleteImage = useCallback(() => {
    const image = selectedImages[0];
    const index = images.findIndex(item => item.id === image.id);
    onDelete(selectedImages);

    const newImageItems = images.filter(item => item.id !== image.id);
    let newSelectedImage;

    if (newImageItems.length === 0) {
      setSelectedImages([]);
      setIsImagePopupOpen(false);
      setImageIndex(0);
    } else {
      const newIndex = index >= newImageItems.length ? 0 : index;
      newSelectedImage = newImageItems[newIndex];
      setImageIndex(newIndex);
    }

    setSelectedImages(newSelectedImage ? [newSelectedImage] : []);
    updateSelectedImage(newSelectedImage);
  }, [selectedImages, images, onDelete, updateSelectedImage]);

  const handleDateTagClick = useCallback((event, groupName) => {
    event.preventDefault();
    if (mode === GALLERY_DATE_MODE.MONTH) {
      const image = groups.find(group => group.name === groupName)?.children[0]?.children[0];
      if (image) {
        lastState.current = { ...lastState.current, targetGroupFirstImageId: image.id };
      }
      window.sfMetadataContext.eventBus.dispatch(EVENT_BUS_TYPE.SWITCH_GALLERY_GROUP_BY, GALLERY_DATE_MODE.DAY);
    }
  }, [mode, groups]);

  useEffect(() => {
    updateCurrentDirent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const gear = window.sfMetadataContext.localStorage.getItem(STORAGE_GALLERY_ZOOM_GEAR_KEY, 0) || 0;
    setZoomGear(gear);

    const mode = window.sfMetadataContext.localStorage.getItem(STORAGE_GALLERY_DATE_MODE_KEY, GALLERY_DATE_MODE.DAY) || GALLERY_DATE_MODE.DAY;
    setMode(mode);
    lastState.current = { ...lastState.current, mode };

    const switchGalleryModeSubscribe = window.sfMetadataContext.eventBus.subscribe(
      EVENT_BUS_TYPE.SWITCH_GALLERY_GROUP_BY,
      (mode) => {
        setSelectedImages([]);
        setMode(mode);
        lastState.current = { ...lastState.current, mode };
        window.sfMetadataContext.localStorage.setItem(STORAGE_GALLERY_DATE_MODE_KEY, mode);
      }
    );

    const container = containerRef.current;
    if (container) {
      const { offsetWidth, clientHeight } = container;
      setContainerWidth(offsetWidth);

      // Calculate initial overScan information
      setOverScan({ top: 0, bottom: clientHeight + rowHeight * OVER_SCAN_ROWS });
    }
    setFirstLoading(false);

    // resize
    const handleResize = () => {
      if (!container) return;
      setContainerWidth(container.offsetWidth);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    container && resizeObserver.observe(container);

    // op
    const modifyGalleryZoomGearSubscribe = window.sfMetadataContext.eventBus.subscribe(EVENT_BUS_TYPE.MODIFY_GALLERY_ZOOM_GEAR, (zoomGear) => {
      window.sfMetadataContext.localStorage.setItem(STORAGE_GALLERY_ZOOM_GEAR_KEY, zoomGear);
      setZoomGear(zoomGear);
    });

    return () => {
      container && resizeObserver.unobserve(container);
      modifyGalleryZoomGearSubscribe();
      switchGalleryModeSubscribe();
    };
  }, [rowHeight]);

  useEffect(() => {
    if (!imageSize || imageSize?.large < 0) return;
    if (lastState.current?.mode === mode && mode === GALLERY_DATE_MODE.ALL && !ObjectUtils.isSameObject(imageSize, lastState.current.imageSize)) {
      const perImageOffset = imageSize.large - (lastState.current.imageSize?.large || 0);
      const { groupIndex, rowIndex } = lastState.current.visibleAreaFirstImage;
      const rowOffset = groups.reduce((previousValue, current, currentIndex) => {
        if (currentIndex < groupIndex) {
          return previousValue + current.children.length;
        }
        return previousValue;
      }, 0) + rowIndex;
      const topOffset = rowOffset * perImageOffset + groupIndex * (mode === GALLERY_DATE_MODE.ALL ? 0 : DATE_TAG_HEIGHT);
      scrollContainer.current.scrollTop = scrollContainer.current.scrollTop + topOffset;
      lastState.current = { ...lastState.current, imageSize, mode };
    }
  }, [mode, imageSize, groups]);

  useEffect(() => {
    if (containerHeight < window.innerHeight) {
      onLoadMore && onLoadMore();
    }
  }, [containerHeight, onLoadMore]);

  useEffect(() => {
    if (!imageSize || imageSize?.large < 0) return;
    const { targetGroupFirstImageId: imageId } = lastState.current;
    if (imageId) {
      if (mode === GALLERY_DATE_MODE.ALL) {
        const targetImage = images.find(img => img.id === imageId);
        if (targetImage) {
          scrollContainer.current.scrollTop = targetImage.rowIndex * rowHeight - 60;
        }
      } else {
        const targetGroup = groups.find(group => group.children.some(row => row.children.some(img => img.id === imageId)));
        if (targetGroup) {
          scrollContainer.current.scrollTop = targetGroup.top;
        }
      }
      lastState.current = { ...lastState.current, targetGroupFirstImageId: null, mode };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSize, groups, mode]);

  return (
    <div className="sf-metadata-gallery-scroll-container" ref={scrollContainer} onScroll={handleScroll}>
      <div
        className={`sf-metadata-gallery-container sf-metadata-gallery-container-${mode}`}
        ref={containerRef}
        onMouseDown={handleClickOutside}
      >
        {!isFirstLoading && (
          <>
            <Content
              groups={groups}
              size={imageSize}
              columns={columns}
              overScan={overScan}
              mode={mode}
              rowHeight={rowHeight}
              selectedImages={selectedImages}
              onImageSelect={handleImageSelection}
              onImageClick={handleClick}
              onImageDoubleClick={handleDoubleClick}
              onContextMenu={handleContextMenu}
              onDateTagClick={handleDateTagClick}
            />
            {isLoadingMore &&
              <div className="sf-metadata-gallery-loading-more">
                <CenteredLoading />
              </div>
            }
          </>
        )}
      </div>
      <GalleryContextmenu
        metadata={metadata}
        selectedImages={selectedImages}
        onDelete={handleDeleteSelectedImages}
        onDuplicate={duplicateRecord}
        addFolder={onAddFolder}
        onRemoveImage={handelRemoveSelectedImages}
      />
      {isImagePopupOpen && (
        <ModalPortal>
          <ImageDialog
            imageItems={images}
            imageIndex={imageIndex}
            closeImagePopup={closeImagePopup}
            moveToPrevImage={moveToPrevImage}
            moveToNextImage={moveToNextImage}
            onDeleteImage={deleteImage}
          />
        </ModalPortal>
      )}
    </div>
  );
};

Main.propTypes = {
  isLoadingMore: PropTypes.bool,
  metadata: PropTypes.object,
  onDelete: PropTypes.func,
  onLoadMore: PropTypes.func,
  duplicateRecord: PropTypes.func,
  onAddFolder: PropTypes.func,
};

export default Main;
