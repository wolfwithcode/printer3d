import React, { useState } from 'react'
import { Typography, Button, Form, message, Input, Icon } from 'antd';
import FileUpload from '../../utils/FileUpload'
import Axios from 'axios';

const { Title } = Typography;
const { TextArea } = Input;

// const Continents = [
//     { key: 1, value: "Africa" },
//     { key: 2, value: "Europe" },
//     { key: 3, value: "Asia" },
//     { key: 4, value: "North America" },
//     { key: 5, value: "South America" },
//     { key: 6, value: "Australia" },
//     { key: 7, value: "Antarctica" }
// ]

function UploadProductPage(props) {
    console.log(props.location.state.product)
    const [TitleValue, setTitleValue] = useState(props.location.state.product.title ? props.location.state.product.title : "")
    const [DescriptionValue, setDescriptionValue] = useState(props.location.state.product.description ? props.location.state.product.description : "")
    const [PriceValue, setPriceValue] = useState(props.location.state.product.price ? props.location.state.product.price : 0)
    // const [ContinentValue, setContinentValue] = useState(1)

    const [Images, setImages] = useState(props.location.state.product.images ? props.location.state.product.images : [])


    const onTitleChange = (event) => {
        setTitleValue(event.currentTarget.value)
    }

    const onDescriptionChange = (event) => {
        setDescriptionValue(event.currentTarget.value)
    }

    const onPriceChange = (event) => {
        setPriceValue(event.currentTarget.value)
    }

    // const onContinentsSelectChange = (event) => {
    //     setContinentValue(event.currentTarget.value)
    // }

    const updateImages = (newImages) => {
        setImages(newImages)
    }

    const deleteProduct = (event) => {
        event.preventDefault();

        Axios.post('/api/product/deleteProduct', props.location.state.product)
                .then(response => {
                    if (response.data.success) {
                        alert('Product Successfully Deleted')
                        props.history.push('/edit_remove')
                    } else {
                        alert('Failed to delete Product')
                    }
                })
                .catch((err) => {
                    console.error(err);
                })    
    }

    const onSubmit = (event) => {
        event.preventDefault();


        if (!TitleValue || !DescriptionValue || !PriceValue ||
            // !ContinentValue || 
            !Images) {
            return alert('fill all the fields first!')
        }

        const variables = {
            writer: props.user.userData._id,
            title: TitleValue,
            description: DescriptionValue,
            price: PriceValue,
            images: Images
            // continents: ContinentValue,
        } 

        const update_variables = {
            writer: props.user.userData._id,
            title: TitleValue,
            description: DescriptionValue,
            price: PriceValue,
            images: Images,
            _id: props.location.state.product._id
        }

        {props.location.state.product ? 
            Axios.post('/api/product/updateProduct', update_variables)
            .then(response => {
                if (response.data.success) {
                    alert('Product Successfully Updated')
                    props.history.push('/edit_remove')
                } else {
                    alert('Failed to update Product')
                }
            })
            .catch((err) => {
                console.error(err);
            })
        :
            Axios.post('/api/product/uploadProduct', variables)
                .then(response => {
                    if (response.data.success) {
                        alert('Product Successfully Uploaded')
                        props.history.push('/')
                    } else {
                        alert('Failed to upload Product')
                    }
                })
                .catch((err) => {
                    console.error(err);
                })    
        }
    }

    return (
        <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                {props.location.state.product ? 
                    <Title level={2}>Điều Chỉnh Sản Phẩm</Title>                
                :
                    <Title level={2}>Tạo Sản Phẩm Mới</Title> 
                }
            </div>


            <Form onSubmit={onSubmit} >

                {/* DropZone */}
                <FileUpload refreshFunction={updateImages} />

                <br />
                <br />
                <label>Tên máy</label>
                <Input
                    onChange={onTitleChange}
                    value={TitleValue}
                />
                <br />
                <br />
                <label>Mô tả</label>
                <TextArea
                    onChange={onDescriptionChange}
                    value={DescriptionValue}
                />
                <br />
                <br />
                <label>Giá sản phẩm(VND)</label>
                <Input
                    onChange={onPriceChange}
                    value={PriceValue}
                    type="number"
                />
                <br /><br />
                {/* <select onChange={onContinentsSelectChange} value={2}>
                    {Continents.map(item => (
                        <option key={item.key} value={item.key}>{item.value} </option>
                    ))}
                </select> */}
                <br />
                <br />

                <div style={{display:'flex', justifyContent: 'space-between'}}>
                    <Button
                        onClick={onSubmit}
                    >
                        HOÀN THÀNH
                    </Button>
                    
                    {props.location.state.product ?
                        <Button
                            onClick={deleteProduct}
                        >
                            Xóa sản phẩm
                        </Button>
                    :
                    ''
                    }
                

                </div>

            </Form>

        </div>
    )
}

export default UploadProductPage
