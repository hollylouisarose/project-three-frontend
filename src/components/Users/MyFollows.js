import React from 'react'
import { useParams } from 'react-router'
import { useHistory } from 'react-router-dom'
import { showUser } from '../../functionLib/api.js'

function MyFollows() {
  const { userId } = useParams()
  const [follows, setFollows] = React.useState([])
  const [followsTwo, setFollowsTwo] = React.useState([])
  const [userData, setUserData] = React.useState(null)
  const history = useHistory()

  React.useEffect(() => { 
    async function getUserData() {
      try {
        const result = await showUser(userId)
        setUserData(result.data)
      } catch (err) {
        console.log(err)
      }
    }
    getUserData()
  }, [userId])

  React.useEffect(() => { 
    getData(userData)
  }, [userData])

  function getData(result) {
    try {
      if ((result) && (result.myFollowing)) {
        const followings = []
        result.myFollowing.map((followId, index) => {
          getFollowData(followId, index, result.myFollowing, followings)
        })
      }
    } catch (err) {
      console.log(err)
    }
  }

  async function getFollowData(followId, index, dataArray, followings) {
    const resUser = await showUser(followId)
    const followOutput = { username: resUser.data.username, _id: resUser.data._id }
    followings.push({ ...followOutput })
    if (dataArray.length === index + 1) {
      setFollows(followings)
    }
  }

  React.useEffect(() => {
    console.log('follows', follows)
    function getUser() {
      try {
        if ((userData) && (userData.myFollowing) && userData.myFollowing.length !== follows.length) {
          getData()
        } else if ((followsTwo.length === 0) && (userData)) {
          setFollowsTwo(follows)
        }
      } catch (err) {
        console.log(err)
      }
    }
    getUser()
  }, [follows])

  

  function handleFollow(e) {
    history.push(`/users/${e.target.id}`)
  }

  return (
    <>
      {(followsTwo.length > 0) &&
        followsTwo.map(user => {
          return (
            <div key={user._id} onClick={handleFollow} >
              <p id={user._id} >{user.username}</p>
            </div>
          )
        })
      }
      {(userData) && (!(userData.myFollowing) || (userData.myFollowing.length === 0)) &&
      <p>Not following anyone</p>
      }
      {(followsTwo.length === 0) && !((userData) && (!(userData.myFollowing) || (userData.myFollowing.length === 0))) &&
      <p>...Loading</p>
      }
    </>
  )
}

export default MyFollows