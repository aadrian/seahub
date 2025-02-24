import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Label, Input, Modal, ModalBody, ModalFooter, Alert } from 'reactstrap';
import { gettext } from '../../utils/constants';
import { SeahubSelect } from '../common/select';
import { seafileAPI } from '../../utils/seafile-api';
import toaster from '../toast';
import SeahubModalHeader from '@/components/common/seahub-modal-header';

const propTypes = {
  sharedToken: PropTypes.string.isRequired,
  filePath: PropTypes.string.isRequired,
  toggleAddAbuseReportDialog: PropTypes.func.isRequired,
  isAddAbuseReportDialogOpen: PropTypes.bool.isRequired,
  contactEmail: PropTypes.string.isRequired,
};

class AddAbuseReportDialog extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      abuseType: 'copyright',
      description: '',
      reporter: this.props.contactEmail,
      errMessage: '',
    };
    this.typeOptions = [
      { value: 'copyright', label: gettext('Copyright Infringement') },
      { value: 'virus', label: gettext('Virus') },
      { value: 'abuse_content', label: gettext('Abuse Content') },
      { value: 'other', label: gettext('Other') },
    ];
  }

  onAbuseReport = () => {
    if (!this.state.reporter) {
      this.setState({
        errMessage: gettext('Contact information is required.')
      });
      return;
    }
    seafileAPI.addAbuseReport(this.props.sharedToken, this.state.abuseType, this.state.description, this.state.reporter, this.props.filePath).then((res) => {
      this.props.toggleAddAbuseReportDialog();
      toaster.success(gettext('Abuse report added'), { duration: 2 });
    }).catch((error) => {
      if (error.response) {
        this.setState({
          errMessage: error.response.data.error_msg
        });
      }
    });
  };

  onAbuseTypeChange = (option) => {
    let type = option.value;
    if (type === this.state.abuseType) {
      return;
    }
    this.setState({ abuseType: type });
  };

  setReporter = (event) => {
    let reporter = event.target.value.trim();
    this.setState({ reporter: reporter });
  };

  setDescription = (event) => {
    let desc = event.target.value.trim();
    this.setState({ description: desc });
  };

  render() {
    return (
      <Modal isOpen={this.props.isAddAbuseReportDialogOpen} toggle={this.props.toggleAddAbuseReportDialog}>
        <SeahubModalHeader toggle={this.props.toggleAddAbuseReportDialog}>{gettext('Report Abuse')}</SeahubModalHeader>
        <ModalBody>
          <Form>
            <FormGroup>
              <Label>{gettext('Abuse Type')}</Label>
              <SeahubSelect
                options={this.typeOptions}
                value={this.typeOptions.find(option => option.value === this.state.abuseType) || this.typeOptions[0]}
                onChange={this.onAbuseTypeChange}
                isClearable={false}
              />
            </FormGroup>
            <FormGroup>
              <Label>{gettext('Contact Information')}</Label>
              <Input
                name="abuse-report-contact-information"
                type="text"
                value={this.state.reporter}
                onChange={(event) => this.setReporter(event)}
              />
            </FormGroup>
            <FormGroup>
              <Label>{gettext('Description')}</Label>
              <Input
                name="abuse-report-description"
                type="textarea"
                onChange={(event) => this.setDescription(event)}
              />
            </FormGroup>
          </Form>
          {this.state.errMessage && <Alert color="danger">{this.state.errMessage}</Alert>}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={this.props.toggleAddAbuseReportDialog}>{gettext('Cancel')}</Button>
          <Button color="primary" onClick={this.onAbuseReport}>{gettext('Submit')}</Button>
        </ModalFooter>
      </Modal>
    );
  }
}

AddAbuseReportDialog.propTypes = propTypes;

export default AddAbuseReportDialog;
