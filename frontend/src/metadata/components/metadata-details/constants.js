import { PRIVATE_COLUMN_KEY, CellType } from '../../constants';

export const NOT_DISPLAY_COLUMN_KEYS = [
  PRIVATE_COLUMN_KEY.ID,
  PRIVATE_COLUMN_KEY.CTIME,
  PRIVATE_COLUMN_KEY.MTIME,
  PRIVATE_COLUMN_KEY.CREATOR,
  PRIVATE_COLUMN_KEY.LAST_MODIFIER,
  PRIVATE_COLUMN_KEY.FILE_CREATOR,
  PRIVATE_COLUMN_KEY.FILE_CTIME,
  PRIVATE_COLUMN_KEY.FILE_MODIFIER,
  PRIVATE_COLUMN_KEY.FILE_MTIME,
  PRIVATE_COLUMN_KEY.PARENT_DIR,
  PRIVATE_COLUMN_KEY.FILE_NAME,
  PRIVATE_COLUMN_KEY.IS_DIR,
  PRIVATE_COLUMN_KEY.FILE_TYPE,
  PRIVATE_COLUMN_KEY.OBJ_ID,
  PRIVATE_COLUMN_KEY.SIZE,
  PRIVATE_COLUMN_KEY.SUFFIX,
  PRIVATE_COLUMN_KEY.FILE_DETAILS,
  PRIVATE_COLUMN_KEY.LOCATION,
  PRIVATE_COLUMN_KEY.FACE_LINKS,
  PRIVATE_COLUMN_KEY.FACE_VECTORS,
];

export {
  PRIVATE_COLUMN_KEY,
  CellType,
};
