import React from 'react';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';



// This method is created for cross-browser compatibility, if you don't
// need to support IE11, you can use Array.prototype.sort() directly
function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}


function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}



function getCellData (type) {
    switch (type) {
      case 'test':
        return ['name', 'code', 'population', 'size', 'density'];
      case 'user':
        return ['id', 'name', 'username', 'mobile', 'type', 'isAdmin'];
      case 'products':
        return ['_id', 'name', 'description', 'price', 'numReviews', 'rating'];
      default:
        throw new Error ("Invalid Data Type")
    }
}


export default function CustomTableBody (props) {

  const {
    dataType,
    rows,
    order,
    orderBy,
    rowsPerPage,
    page,
    handleClick,
    isSelected,
    emptyRows,
    dense
  } = props;


  return (
    <TableBody>
      {/* if you don't need to support IE11, you can replace the `stableSort` call with:
         rows.slice().sort(getComparator(order, orderBy)) */}
      {stableSort(rows, getComparator(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row, index) => {
          const cells = getCellData(dataType);

          const isItemSelected = isSelected(row[cells[0]]);
          const labelId = `enhanced-table-checkbox-${index}`;

          return (
            <TableRow
              hover
              onClick={(event) => handleClick(event, row[cells[0]])}
              role="checkbox"
              aria-checked={isItemSelected}
              tabIndex={-1}
              key={row[cells[0]]}
              selected={isItemSelected}
            >
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  checked={isItemSelected}
                  inputProps={{
                    'aria-labelledby': labelId,
                  }}
                />
              </TableCell>
              { cells.map( (cell, idx) =>
                  <TableCell key={idx}>{row[cell]}</TableCell>
              )}
            </TableRow>
          );
        })}
      {emptyRows > 0 && (
        <TableRow
          style={{
            height: (dense ? 33 : 53) * emptyRows,
          }}
        >
          <TableCell colSpan={6} />
        </TableRow>
      )}
    </TableBody>
  )
}
