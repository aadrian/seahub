import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { gettext } from '../../../utils/constants';
import { Utils } from '../../../utils/utils';
import TreeSection from '../../tree-section';
import TrashDialog from '../../dialog/trash-dialog';
import LibSettingsDialog from '../../dialog/lib-settings';
import RepoHistoryDialog from '../../dialog/repo-history';
import { eventBus } from '../../common/event-bus';
import { EVENT_BUS_TYPE } from '../../common/event-bus-type';
import { TAB } from '../../../constants/repo-setting-tabs';

import './index.css';

const DirOthers = ({ userPerm, repoID, currentRepoInfo }) => {

  const showSettings = currentRepoInfo.is_admin; // repo owner, department admin, shared with 'Admin' permission
  let [isSettingsDialogOpen, setSettingsDialogOpen] = useState(false);
  let [activeTab, setActiveTab] = useState(TAB.HISTORY_SETTING);
  let [showMigrateTip, setShowMigrateTip] = useState(false);

  const toggleSettingsDialog = () => {
    setSettingsDialogOpen(!isSettingsDialogOpen);
  };

  useEffect(() => {
    const unsubscribeUnselectFiles = eventBus.subscribe(EVENT_BUS_TYPE.OPEN_LIBRARY_SETTINGS_TAGS, () => {
      setSettingsDialogOpen(true);
      setActiveTab(TAB.TAGS_SETTING);
      setShowMigrateTip(true);
    });
    return () => {
      unsubscribeUnselectFiles();
    };
  });

  const [showTrashDialog, setShowTrashDialog] = useState(false);
  const toggleTrashDialog = () => {
    setShowTrashDialog(!showTrashDialog);
  };

  let [isRepoHistoryDialogOpen, setRepoHistoryDialogOpen] = useState(false);
  const toggleRepoHistoryDialog = () => {
    setRepoHistoryDialogOpen(!isRepoHistoryDialogOpen);
  };

  return (
    <TreeSection title={gettext('Others')} className="dir-others">
      {showSettings && (
        <div className='dir-others-item text-nowrap' title={gettext('Settings')} onClick={toggleSettingsDialog}>
          <span className="sf3-font-set-up sf3-font"></span>
          <span className="dir-others-item-text">{gettext('Settings')}</span>
        </div>
      )}
      {userPerm == 'rw' && (
        <div className='dir-others-item text-nowrap' title={gettext('Trash')} onClick={toggleTrashDialog}>
          <span className="sf3-font-trash sf3-font"></span>
          <span className="dir-others-item-text">{gettext('Trash')}</span>
        </div>
      )}
      {Utils.isDesktop() && (
        <div className='dir-others-item text-nowrap' title={gettext('History')} onClick={toggleRepoHistoryDialog}>
          <span className="sf3-font-history sf3-font"></span>
          <span className="dir-others-item-text">{gettext('History')}</span>
        </div>
      )}
      {showTrashDialog && (
        <TrashDialog
          repoID={repoID}
          currentRepoInfo={currentRepoInfo}
          showTrashDialog={showTrashDialog}
          toggleTrashDialog={toggleTrashDialog}
        />
      )}
      {isSettingsDialogOpen && (
        <LibSettingsDialog
          repoID={repoID}
          currentRepoInfo={currentRepoInfo}
          toggleDialog={toggleSettingsDialog}
          tab={activeTab}
          showMigrateTip={showMigrateTip}
        />
      )}
      {isRepoHistoryDialogOpen && (
        <RepoHistoryDialog
          repoID={repoID}
          userPerm={userPerm}
          currentRepoInfo={currentRepoInfo}
          toggleDialog={toggleRepoHistoryDialog}
        />
      )}
    </TreeSection>
  );
};

DirOthers.propTypes = {
  userPerm: PropTypes.string,
  repoID: PropTypes.string,
  currentRepoInfo: PropTypes.object.isRequired,
};

export default DirOthers;
