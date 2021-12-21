import React from 'react';
import { Button } from 'react-bootstrap';


const styles = {
  container: {
    position: 'absolute',
    top: '0',
    left: '0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100vh',
    background: 'rgba(0, 0, 0, 0.3)'
  },
  rowStart: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: '15px'
  },
  modal: {
    background: 'white',
    borderRadius: '10px',
    padding: '15px',
    maxWidth: '40%',
    boxShadow: 'gray 1px 2px 2px'
  }
}


export default function ConfirmationBox ({dismiss, action, text}) {




  return (
    <div style={styles.container}>
      <div style={styles.modal}>
        <h5>{text}</h5>
        <div>
          <Button
            className='btn btn-primary mr-2'
            onClick={action}
          >
            Yes
          </Button>
          <Button
            className='btn btn-light mx-1'
            onClick={dismiss}
          >
            No
          </Button>
        </div>
      </div>
    </div>
  );
}
