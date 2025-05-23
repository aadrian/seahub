import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Form, FormGroup, Input, Col } from 'reactstrap';
import { Utils } from '../../utils/utils';
import { orgAdminAPI } from '../../utils/org-admin-api';
import { gettext, orgID } from '../../utils/constants';
import toaster from '../../components/toast';
import UserItem from './org-user-item';
import OrgUserInfo from '../../models/org-user';

class OrgUsersSearchUsersResult extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isItemFreezed: false
    };
  }

  onFreezedItem = () => {
    this.setState({ isItemFreezed: true });
  };

  onUnfreezedItem = () => {
    this.setState({ isItemFreezed: false });
  };

  render() {
    let { orgUsers, changeStatus } = this.props;
    return (
      <div className="cur-view-content">
        <table>
          <thead>
            <tr>
              <th width="30%">{gettext('Name')}</th>
              <th width="15%">{gettext('Status')}</th>
              <th width="20%">
                <a className="d-inline-block table-sort-op" href="#" >{gettext('Space Used')}</a> / {gettext('Quota')}
              </th>
              <th width="25%">{gettext('Created At')} / {gettext('Last Login')}</th>
              <th width="10%">{/* Operations*/}</th>
            </tr>
          </thead>
          <tbody>
            {orgUsers.map((item, index) => {
              return (
                <UserItem
                  key={index}
                  user={item}
                  currentTab="users"
                  isItemFreezed={this.state.isItemFreezed}
                  toggleDelete={this.props.toggleDelete}
                  onFreezedItem={this.onFreezedItem}
                  onUnfreezedItem={this.onUnfreezedItem}
                  changeStatus={changeStatus}
                />
              );})}
          </tbody>
        </table>
      </div>
    );
  }
}

OrgUsersSearchUsersResult.propTypes = {
  toggleDelete: PropTypes.func.isRequired,
  orgUsers: PropTypes.array.isRequired,
  changeStatus: PropTypes.func.isRequired,
};

class OrgUsersSearchUsers extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: '',
      orgUsers: [],
      org_id: '',
      isSubmitBtnActive: false,
      loading: true,
      errorMsg: '',
    };
  }

  componentDidMount() {
    let params = (new URL(document.location)).searchParams;
    this.setState({
      query: params.get('query') || '',
    }, () => {this.getItems();});
  }

  getItems = () => {
    orgAdminAPI.orgAdminSearchUser(orgID, this.state.query.trim()).then(res => {
      let userList = res.data.user_list.map(item => {
        return new OrgUserInfo(item);
      });
      this.setState({
        orgUsers: userList,
        loading: false,
      });
    }).catch((error) => {
      this.setState({
        loading: false,
        errorMsg: Utils.getErrorMsg(error, true) // true: show login tip if 403
      });
    });
  };

  deleteUser = (email, username) => {
    orgAdminAPI.orgAdminDeleteOrgUser(orgID, email).then(res => {
      let newUserList = this.state.orgUsers.filter(item => {
        return item.email != email;
      });
      this.setState({ orgUsers: newUserList });
      let msg = gettext('Deleted user %s');
      msg = msg.replace('%s', username);
      toaster.success(msg);
    }).catch((error) => {
      let errMessage = Utils.getErrorMsg(error);
      toaster.danger(errMessage);
    });
  };

  handleInputChange = (e) => {
    this.setState({
      query: e.target.value
    }, this.checkSubmitBtnActive);
  };

  checkSubmitBtnActive = () => {
    const { query } = this.state;
    this.setState({
      isSubmitBtnActive: query.trim()
    });
  };

  handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      const { isSubmitBtnActive } = this.state;
      if (isSubmitBtnActive) {
        this.getItems();
      }
    }
  };

  changeStatus = (email, isActive) => {
    orgAdminAPI.orgAdminChangeOrgUserStatus(orgID, email, isActive).then(res => {
      let users = this.state.orgUsers.map(item => {
        if (item.email == email) {
          item['is_active'] = res.data['is_active'];
        }
        return item;
      });
      this.setState({ orgUsers: users });
      toaster.success(gettext('Edit succeeded.'));
    }).catch(error => {
      let errMessage = Utils.getErrorMsg(error);
      toaster.danger(errMessage);
    });
  };

  render() {
    const { query, isSubmitBtnActive } = this.state;

    return (
      <Fragment>
        <div className="main-panel-center flex-row">
          <div className="cur-view-container">
            <div className="cur-view-path">
              <h3 className="sf-heading">{gettext('Users')}</h3>
            </div>
            <div className="cur-view-content">
              <div className="mt-4 mb-6">
                <h4 className="border-bottom font-weight-normal mb-2 pb-1">{gettext('Search Users')}</h4>
                <Form tag={'div'}>
                  <FormGroup row>
                    <Col sm={5}>
                      <Input type="text" name="query" value={query} placeholder={gettext('Search users')} onChange={this.handleInputChange} onKeyDown={this.handleKeyDown} />
                    </Col>
                  </FormGroup>
                  <FormGroup row>
                    <Col sm={{ size: 5 }}>
                      <button className="btn btn-outline-primary" disabled={!isSubmitBtnActive} onClick={this.getItems}>{gettext('Submit')}</button>
                    </Col>
                  </FormGroup>
                </Form>
              </div>
              <div className="mt-4 mb-6">
                <h4 className="border-bottom font-weight-normal mb-2 pb-1">{gettext('Result')}</h4>
                <OrgUsersSearchUsersResult
                  toggleDelete={this.deleteUser}
                  changeStatus={this.changeStatus}
                  orgUsers={this.state.orgUsers}
                />
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

export default OrgUsersSearchUsers;
