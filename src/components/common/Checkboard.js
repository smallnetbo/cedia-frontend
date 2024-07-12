import React, { isValidElement } from 'react';
import reactCSS from 'reactcss';
import * as checkboard from '../../helpers/checkboard';

export var Checkboard = function Checkboard({
  white = 'transparent',
  grey = 'rgba(0,0,0,.08)',
  size = 8,
  renderers = {},
  borderRadius,
  boxShadow,
  children
}) {
  var styles = reactCSS({
    'default': {
      grid: {
        borderRadius: borderRadius,
        boxShadow: boxShadow,
        absolute: '0px 0px 0px 0px',
        background: 'url(' + checkboard.get(white, grey, size, renderers.canvas) + ') center left'
      }
    }
  });

  return isValidElement(children) 
    ? React.cloneElement(children, _extends({}, children.props, { style: _extends({}, children.props.style, styles.grid) })) 
    : React.createElement('div', { style: styles.grid });
};

export default Checkboard;
