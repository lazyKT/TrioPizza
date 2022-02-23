import axios from 'axios';


export async function createContactSupportRequest (body) {
  try {
    const { data } = await axios.post('http://167.71.221.189/api/support/', body, {
      headers: {
        'Content-Type' : 'application/json'
      }
    });

    return { error: false, data }
  }
  catch (error) {
    if (error.response && error.response.data.details)
      return { error: true, message: error.response.data.details };
    else
      return { error: true, message: error.message };
  }
}
