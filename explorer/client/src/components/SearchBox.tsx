import React from 'react'
import { connect } from 'react-redux'
import Paper from '@material-ui/core/Paper'
import IconButton from '@material-ui/core/IconButton'
import SearchIcon from '@material-ui/icons/Search'
import InputBase from '@material-ui/core/InputBase'
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles'
import classNames from 'classnames'
import { AppState } from '../reducers'

const styles = ({ palette, spacing }: Theme) =>
  createStyles({
    paper: {
      display: 'flex',
      border: 'solid 1px',
      borderColor: palette.grey['300'],
      padding: spacing.unit,
    },
    query: {
      flexGrow: 1,
      boxSizing: 'border-box',
      color: palette.text.primary,
    },
  })

interface Props extends WithStyles<typeof styles> {
  className?: string
  query?: string
}

const SearchBox = ({ classes, className, query }: Props) => {
  return (
    <Paper elevation={0} className={classNames(classes.paper, className)}>
      <IconButton aria-label="Search" type="submit">
        <SearchIcon />
      </IconButton>
      <InputBase
        className={classes.query}
        defaultValue={query}
        placeholder="Search for Job IDs, Run IDs, Transaction Hashes, or Requesting Addresses"
        name="search"
      />
    </Paper>
  )
}

const mapStateToProps = (state: AppState) => {
  return {
    query: state.search.query,
  }
}

const mapDispatchToProps = () => ({})

const ConnectedSearchBox = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SearchBox)

export default withStyles(styles)(ConnectedSearchBox)
