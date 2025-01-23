import { PRIVATE_COLUMN_KEY } from './private';

export const NOT_DISPLAY_COLUMN_KEYS = [
  PRIVATE_COLUMN_KEY.ID,
  PRIVATE_COLUMN_KEY.CTIME,
  PRIVATE_COLUMN_KEY.MTIME,
  PRIVATE_COLUMN_KEY.CREATOR,
  PRIVATE_COLUMN_KEY.LAST_MODIFIER,
  PRIVATE_COLUMN_KEY.OBJ_ID,
  PRIVATE_COLUMN_KEY.FILE_DETAILS,
  PRIVATE_COLUMN_KEY.LOCATION,
  PRIVATE_COLUMN_KEY.IS_DIR,
  PRIVATE_COLUMN_KEY.FACE_LINKS,
  PRIVATE_COLUMN_KEY.EXCLUDED_FACE_LINKS,
  PRIVATE_COLUMN_KEY.FACE_VECTORS,
  PRIVATE_COLUMN_KEY.OCR,
];

export const VIEW_NOT_DISPLAY_COLUMN_KEYS = [
  PRIVATE_COLUMN_KEY.IS_DIR,
];
