

export const getToken = async () => {
    try {
      const response = await fetch("/get-token");
  
      if (response.ok) {
        const data = await response.json();
        const authToken = data.token;
        console.log(authToken)
        return authToken;
      } else {
        throw new Error(`Failed to get authentication token: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(`An error occurred while fetching the authentication token: ${error.message}`);
    }
  };
  


export const authToken = await getToken()

// API call to create meeting
export const createMeeting = async ({ token }) => {
    const res = await fetch(`https://api.videosdk.live/v2/rooms`, {
        method: "POST",
        headers: {
            authorization: `${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });
    //Destructuring the roomId from the response
    const { roomId } = await res.json();
    return roomId;
};

export const validateMeeting = async ({meetingId,token}) => {
  console.log(meetingId)
  console.log(token)
  const res = await fetch(`https://api.videosdk.live/v2/rooms/validate/${meetingId}` , {
    method: "GET",
        headers: {
            authorization: `${token}`,
            "Content-Type": "application/json",
        }
  })
  if(res.status == 200){
    return true
  }
  else return false
  
}