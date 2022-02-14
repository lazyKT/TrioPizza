import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';

import CustomTableHead from './CustomTableHead';
import CustomTableBody from './CustomTableBody';


const EnhancedTableToolbar = (props) => {

  const { selected, openEditPannel } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(selected && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        }),
      }}
    >
      {selected && (
        <Typography
          sx={{ flex: '1 1 100%' }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          data selected
        </Typography>
      )}

      {selected && (
        <Tooltip title="Edit">
          <IconButton
            color="primary"
            onClick={() => openEditPannel(selected._id)}
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      )}
    </Toolbar>
  );
};

// EnhancedTableToolbar.propTypes = {
//   numSelected: PropTypes.number.isRequired,
// };

export default function CustomTable (props) {

  const { columns, rows, type, edit } = props;

  const [ order, setOrder ] = useState('asc');
  const [ orderBy, setOrderBy ] = useState('calories');
  const [ selected, setSelected ] = useState(null);
  const [ page, setPage ] = useState(0);
  const [ dense, setDense ] = useState(false);
  const [ rowsPerPage, setRowsPerPage ] = useState(5);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClick = (event, selectedIndex) => {
    if (selectedIndex === selected)
      setSelected(null);
    else
      setSelected(selectedIndex);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleChangeDense = (event) => {
    setDense(event.target.checked);
  };

  const isSelected = (idx) => selected === idx;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: '100%' }}>
      { rows &&
        (
          <>
            <Paper sx={{ width: '100%', mb: 2 }}>


              <EnhancedTableToolbar
                selected={rows[selected]}
                openEditPannel={(id) => edit(id)}
              />

              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size={dense ? 'small' : 'medium'}
                >
                  <CustomTableHead
                    headCells={columns}
                    order={order}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                    rowCount={rows.length}
                    type={type}
                  />
                  <CustomTableBody
                    rows={rows}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleClick={handleClick}
                    orderBy={orderBy}
                    emptyRows={emptyRows}
                    isSelected={isSelected}
                    order={order}
                    dataType={type}
                  />
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
            <FormControlLabel
              control={<Switch checked={dense} onChange={handleChangeDense} />}
              label="Dense padding"
            />
          </>
        )
      }
    </Box>
  );
}
