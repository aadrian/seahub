import React from 'react';
import PropTypes from 'prop-types';
import { Modal, ModalBody, Form } from 'reactstrap';
import { gettext, siteRoot, mediaUrl } from '../../utils/constants';
import { seafileAPI } from '../../utils/seafile-api';
import SeahubModalCloseIcon from '../../components/common/seahub-modal-close';

import '../../css/lib-decrypt.css';

const propTypes = {
  repoID: PropTypes.string.isRequired,
  onLibDecryptDialog: PropTypes.func.isRequired
};


class LibDecryptDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      showError: false,
    };
  }

  handleSubmit = (e) => {
    let repoID = this.props.repoID;
    let password = this.state.password;
    seafileAPI.setRepoDecryptPassword(repoID, password).then(res => {
      this.props.onLibDecryptDialog();
    }).catch(res => {
      this.setState({
        showError: true
      });
    });

    e.preventDefault();
  };

  handleKeyDown = (e) => {
    if (e.key == 'Enter') {
      this.handleSubmit(e);
    }
  };

  handleChange = (e) => {
    this.setState({
      password: e.target.value,
      showError: false
    });
  };

  toggle = () => {
    window.location.href = siteRoot;
  };

  render() {
    return (
      <Modal isOpen={true} toggle={this.toggle}>
        <ModalBody>
          <SeahubModalCloseIcon className="position-absolute top-0 end-0 m-0" toggle={this.toggle} />
          <Form className="lib-decrypt-form text-center">
            <img src={`${mediaUrl}img/lock.png`} alt="" aria-hidden="true" />
            <p className="intro">{gettext('This library is password protected')}</p>
            {this.state.showError &&
              <p className="error">{gettext('Wrong password')}</p>
            }
            <input type="password" name="password" className="form-control password-input" autoComplete="off" onKeyDown={this.handleKeyDown} placeholder={gettext('Password')} onChange={this.handleChange} />
            <button type="submit" className="btn btn-primary submit" onClick={this.handleSubmit}>{gettext('Submit')}</button>
            <p className="tip">{'* '}{gettext('The password will be kept in the server for only 1 hour.')}</p>
          </Form>
        </ModalBody>
      </Modal>
    );
  }
}

LibDecryptDialog.propTypes = propTypes;

export default LibDecryptDialog;
