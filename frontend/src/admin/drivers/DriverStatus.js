import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import { Alert } from 'react-bootstrap';


export default function DriverStatus ({status}) {

  return (
    <>
      { status === 'available'
        ? <Alert className="p-1 m-1" variant='success'>
            <CircleIcon sx={{ fontSize: 10, marginBottom: '2px', marginRight: '5px' }}/>{ status }
          </Alert>
        : (
          status === 'full'
          ? (<Alert className="p-1 m-1" variant='danger'>
              <CircleIcon sx={{ fontSize: 10, marginBottom: '2px', marginRight: '5px' }}/>{ status }
            </Alert>)
          : (<Alert className="p-1 m-1" variant='warning'>
              <CircleIcon sx={{ fontSize: 10, marginBottom: '2px', marginRight: '5px' }}/>{ status }
            </Alert>)
        )
      }
    </>
  )
}
