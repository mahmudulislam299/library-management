import React from 'react'
import './ImageSlider.css'
import { Carousel } from 'react-bootstrap'

function ImageSlider() {
    return (
        <div className='slider'>
            <Carousel>
                <Carousel.Item interval={1000}>
                    <img
                        className="d-block w-100"
                        // src="https://images.unsplash.com/photo-1616070152767-3eb99cf10509?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
                        src="campus1.jpg"
                        alt="First slide"
                    />
                    <Carousel.Caption>
                        <h3>Main Campus</h3>
                        {/* <p>--------</p> */}
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item interval={500}>
                    <img
                        className="d-block w-100"
                        src="campus2.jpg"
                        alt="Second slide"
                    />
                    <Carousel.Caption>
                        <h3>Parmanent Campus</h3>
                        {/* <p>-----------</p> */}
                    </Carousel.Caption>
                </Carousel.Item>
                <Carousel.Item>
                    <img
                        className="d-block w-100"
                        src="lib2.png"
                        alt="Third slide"
                    />
                    <Carousel.Caption>
                        <h3>Library</h3>
                        {/* <p>---------------------------------------</p> */}
                    </Carousel.Caption>
                </Carousel.Item>
            </Carousel>
        </div>
    )
}

export default ImageSlider
