import { lang } from '../utils/constants';
import dayjs from 'dayjs';

dayjs.locale(lang);

class OrgGroupInfo {
  constructor(object) {
    this.id = object.id;
    this.groupName = object.group_name;
    this.creatorName = object.creator_name;
    this.creatorEmail = object.creator_email;
    this.creatorContactEmail = object.creator_contact_email;
    this.ctime = dayjs(object.ctime).format('YYYY-MM-DD HH:mm:ss');
  }
}

export default OrgGroupInfo;
