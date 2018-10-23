// actions/index.js

import { bindActionCreators } from 'redux'
import * as bleActions from './bleActions'
import * as bleHelperActions from './bleHelperActions'

export default dispatch =>
  bindActionCreators(
    {
      ...bleActions,
      ...bleHelperActions,
    },
    dispatch,
  )
