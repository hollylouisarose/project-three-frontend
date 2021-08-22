import React from 'react'
import ReactMapGL, { Marker } from 'react-map-gl'
import axios from 'axios'
import Select from 'react-select'
import CreatableSelect from 'react-select/creatable'
import { useParams } from 'react-router-dom'

function ImageEdit() {
  const { imageId } = useParams()
  const [inputs, setInputs] = React.useState([])
  const [madeBy, setMadeBy] = React.useState('')

  const [typeTags, setTypeTags] = React.useState([])
  const [customTags, setCustomTags] = React.useState([])

  const selectOptions = [
    { value: 'beach', label: 'Beach' },
    { value: 'mountain', label: 'Mountain' },
    { value: 'ocean', label: 'Ocean' },
    { value: 'lake', label: 'Lake' },
    { value: 'forest', label: 'Forest' },
    { value: 'desert', label: 'Desert' },
    { value: 'meadow', label: 'Meadow' }
  ]

  const [images, setImages] = React.useState([
    {
      id: 'test1',
      caption: 'Image 1',
      latitude: 51,
      longitude: 1,
      url: 'https://upload.wikimedia.org/wikipedia/commons/2/27/France_manche_vue_dover.JPG',
      tags: { 
        locations: ['Europe','United Kingdom', 'Strait of Dover'],
        types: ['Cliff', 'Ocean'],
        customs: ['The Channel'],
      },
      addedBy: 'userId1',
    },
    {
      id: 'test2',
      caption: 'Image 2',
      latitude: 54.58,
      longitude: -3.14,
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Derwent-water.jpg/1920px-Derwent-water.jpg',
      tags: { 
        locations: ['Europe','United Kingdom', 'Derwentwater'],
        types: ['Lake', 'Mountain'],
        customs: ['England'],
      },
      addedBy: 'userId2',
    }
  ])
  const users = [
    {
      id: 'userId1',
      username: 'Tarik',
    },
    {
      id: 'userId2',
      username: 'Kirat',
    }
  ]

  const [viewport, setViewport] = React.useState({
    latitude: 0.0,
    longitude: 0.0,
    zoom: 8,
  })

  React.useEffect(() => {
    const inputsArray = images.filter(item => {
      return imageId === item.id
    })

    if (inputsArray.length > 0) {
      setInputs(inputsArray)
      setLatLng({ latitude: inputsArray[0].latitude, longitude: inputsArray[0].longitude })
      setViewport({ ...viewport, latitude: parseFloat(inputsArray[0].latitude), longitude: parseFloat(inputsArray[0].longitude) })


      const userArray = users.filter(item => {
        return inputsArray[0].addedBy === item.id
      })
      if (userArray.length > 0) {
        setMadeBy(userArray[0].username)
      } else {
        setMadeBy('')
      }
    } else {
      setInputs({})
      setMadeBy('')
    }
  }, [])


  const [regions, setRegions] = React.useState([])
  const url = {
    front: 'https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en&latitude=',
    mid: '&longitude=',
  }
  const getLocation = async ({ latitude, longitude }) => {
    try {
      if (latitude === '' || latitude === '-') latitude = '0'
      if (longitude === '' || longitude === '-') longitude = '0'
      const search = url.front + latitude + url.mid + longitude
      const res = await axios.get(search)
      const { continent, countryName, locality } = res.data
      setRegions([continent, countryName, locality].filter(item => {
        return item
      }))
    } catch (err) {
      console.log(err)
    }
  }
  React.useState(() => {
    getLocation(inputs)
  }, [])


  function handleChange(e) {
    setInputs([{ ...inputs[0], [e.target.id]: e.target.value }])
    console.log({ ...inputs[0], [e.target.id]: e.target.value })
  }

  const [latLng, setLatLng] = React.useState({})
  function handleLatLng(e) {
    const id = e.target.id
    const mod = id.length - 7
    const value = e.target.value
    const numValue = parseFloat(value)
    if (value === '') {
      e.target.classList.remove('red')
    } else if (String(numValue) !== value || numValue < -90 * mod || numValue > 90 * mod ) {
      e.target.classList.add('red')
    } else {
      setInputs([{ ...inputs[0], [id]: numValue }])
      getLocation({ ...inputs[0], [id]: numValue })
      e.target.classList.remove('red')
    }
    setLatLng({ ...latLng, [id]: value })
  }

  function handleDragEnd(e) {
    console.log(e.lngLat)
    setInputs({ ...inputs, longitude: e.lngLat[0], latitude: e.lngLat[1] })
    document.querySelector('#longitude').value = e.lngLat[0]
    document.querySelector('#latitude').value = e.lngLat[1]
    getLocation({ latitude: e.lngLat[1], longitude: e.lngLat[0] })
  }

  function handleTags(e) {

  }


  function handleSubmit() {
    console.log('submitted')
  }


  return (
    <>
      <h1>Image Edit:</h1>
      {(inputs.length > 0) ? 
        <div>
          <div>
            <img src={inputs[0].url} />
          </div>
          <div>
            <p>Caption: <input id='caption' onChange={handleChange} value={inputs[0].caption} /></p>
            <p>Latitude: <input id='latitude' onChange={handleLatLng} value={latLng.latitude} /></p>
            <p>Longitude: <input id='longitude' onChange={handleLatLng} value={latLng.longitude} /></p>
            <div className='map-container'>
              <ReactMapGL
                mapboxApiAccessToken={process.env.REACT_APP_MAPBOX_ACCESS_TOKEN}
                height='50vw'
                // width='Calc(100vw - 20px)'
                width='60vw'
                mapStyle='mapbox://styles/mapbox/streets-v11'
                onViewportChange={(nextViewport) => setViewport(nextViewport)}
                {...viewport}
              >
                <Marker 
                  key={inputs[0].caption}
                  latitude={inputs[0].latitude}
                  longitude={inputs[0].longitude}
                  offsetLeft={-8}
                  offsetTop={-19}
                  draggable
                  onDragEnd={handleDragEnd}
                >
                  <span>📍</span>
                </Marker>
              </ReactMapGL>
            </div>
            <p>Regions: {regions.join(', ')}</p>
            <p>Types: <Select
              id='type-tags'
              options={selectOptions}
              isMulti
              onChange={(e) => setTypeTags(e.map(item => item.value))}
            />
            </p>
            <p>Tags: <CreatableSelect 
              isMulti
              onChange={(e) => setCustomTags(e.map(item => item.value))}
            />
            </p>
            <p>Made By: {madeBy}</p>
          </div>
          <input type='submit' onClick={handleSubmit}></input>
        </div> 
        : 
        <div>
          <p>Invalid Image ID: Try another Url!</p>
        </div>
      }
    </>
  )
}

export default ImageEdit