import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { UncontrolledTooltip, DropdownItem } from 'reactstrap';
import classnames from 'classnames';
import { Icon } from '@seafile/sf-metadata-ui-component';

const ColumnDropdownItem = ({ disabled, iconName, target, title, tip, className, onChange, onMouseEnter }) => {

  const onClick = useCallback((event) => {
    event.preventDefault();
  }, []);

  if (!disabled) {
    return (
      <DropdownItem onClick={onChange} onMouseEnter={onMouseEnter} className={className}>
        <Icon iconName={iconName} />
        <span className="item-text">{title}</span>
      </DropdownItem>
    );
  }

  return (
    <DropdownItem
      className={classnames('disabled', className)}
      toggle={true}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      id={target}
    >
      <Icon iconName={iconName} />
      <span className="item-text">{title}</span>
      {disabled &&
        <UncontrolledTooltip placement="right" target={target} fade={false} delay={{ show: 0, hide: 0 }}>
          {tip}
        </UncontrolledTooltip>
      }
    </DropdownItem>
  );

};

ColumnDropdownItem.propTypes = {
  disabled: PropTypes.bool.isRequired,
  target: PropTypes.string.isRequired,
  iconName: PropTypes.string,
  title: PropTypes.string.isRequired,
  tip: PropTypes.string.isRequired,
  className: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onMouseEnter: PropTypes.func.isRequired,
};

ColumnDropdownItem.defaultProps = {
  onChange: () => {},
  onMouseEnter: () => {},
  disabled: false,
  className: '',
};

export default ColumnDropdownItem;
