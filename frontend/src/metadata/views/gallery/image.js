import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const Image = ({
  isSelected,
  img,
  size,
  useOriginalThumbnail,
  style,
  onClick,
  onDoubleClick,
  onContextMenu,
}) => {
  const [background, setBackground] = useState('#f1f1f1');

  const onLoad = useCallback(() => {
    setBackground('unset');
  }, []);

  return (
    <div
      id={img.id}
      tabIndex={1}
      className={classnames('metadata-gallery-image-item', {
        'metadata-gallery-image-item-selected': isSelected,
      })}
      style={{ width: size, height: size, background, ...style }}
      onClick={(e) => onClick(e, img)}
      onDoubleClick={(e) => onDoubleClick(e, img)}
      onContextMenu={(e) => onContextMenu(e, img)}
    >
      <img
        className="metadata-gallery-grid-image"
        src={useOriginalThumbnail ? img.thumbnail : img.src}
        alt={img.name}
        draggable="false"
        onLoad={onLoad}
      />
    </div>
  );
};

Image.propTypes = {
  isSelected: PropTypes.bool,
  img: PropTypes.object,
  size: PropTypes.number,
  style: PropTypes.object,
  useOriginalThumbnail: PropTypes.bool,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,
  onContextMenu: PropTypes.func,
};

export default Image;
