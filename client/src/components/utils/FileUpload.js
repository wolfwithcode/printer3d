import React, { useState } from 'react'
import Dropzone from 'react-dropzone';
import { Icon } from 'antd';
import Axios from 'axios';
function FileUpload(props) {
    const [Images, setImages] = useState(props.images);

    const onDrop = (files) => {

        let formData = new FormData();
        const config = {
            header: { 'content-type': 'multipart/form-data' }
        }
        formData.append("file", files[0])
        //save the Image we chose inside the Node Server 
        Axios.post('/api/product/uploadImage', formData, config)
            .then(async response => {
                if (await response.data.success) {

                    setImages([...Images, response.data.image])
                    props.refreshFunction([...Images, response.data.image])

                } else {
                    alert('Failed to save the Image in Server')
                }
            })
            .catch((err) => {
                console.error(err);
            })
    }


    const onDelete = (image) => {
        const currentIndex = Images.indexOf(image);

        console.log(image)
        let newImages = [...Images]
        newImages.splice(currentIndex, 1)

        //delete the Image we chose inside the Node Server 
        const config = {headers: {'content-type': 'application/json'}};
        Axios.post('/api/product/deleteImage', {"file": image}, config)
            .then(async response => {
                if (await response.data.success) {
                    setImages(newImages)
                    props.refreshFunction(newImages)
                } else {
                    alert('Failed to delete the Image in cloud')
                }
            })
            .catch((err) => {
                console.error(err);
            })
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Dropzone
                onDrop={onDrop}
                multiple={false}
                maxSize={800000000}
            >
                {({ getRootProps, getInputProps }) => (
                    <div style={{
                        width: '300px', height: '240px', border: '1px solid lightgray',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                        {...getRootProps()}
                    >
                        <input {...getInputProps()} />
                        <Icon type="plus" style={{ fontSize: '3rem' }} />

                    </div>
                )}
            </Dropzone>

            <div style={{ display: 'flex', width: '350px', height: '240px', overflowX: 'scroll' }}>

                {Images.map((image, index) => (
                    <div onClick={() => onDelete(image)}>
                        <img style={{ minWidth: '300px', width: '300px', height: '240px' }} src={`${image}`} alt={`productImg-${index}`} />
                    </div>
                ))}


            </div>

        </div>
    )
}

export default FileUpload
