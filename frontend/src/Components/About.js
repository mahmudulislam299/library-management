import React from 'react'
import './About.css'

function About() {
    return (
        <div className='about-box'>
            <h2 className="about-title">About the Library</h2>
            <div className="about-data">
                <div className="about-img">
                    <img src="lib.png" alt="" />
                    {/* <img src="https://images.unsplash.com/photo-1583468982228-19f19164aee2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=913&q=80" alt="" /> */}
                </div>
                <div>
                  <div>
                        <p className="about-text">
                        The Stamford University Bangladesh Library serves as the intellectual heart of the
                        university — a dynamic hub for learning, research, and innovation. Our mission is to
                        empower students, faculty, and researchers with access to an extensive collection of
                        academic resources, both physical and digital.<br/><br/>

                        With a modern catalog system, comfortable study spaces, and a dedicated support team,
                        the library encourages independent study as well as collaborative learning. We provide
                        books, journals, e-resources, and online databases to enrich every academic discipline
                        offered at Stamford University Bangladesh.<br/><br/>
                        
                        As part of our commitment to continuous improvement, we value your suggestions and
                        feedback to help us make the library experience even better for everyone.
                        </p>
                </div>

                </div>
            </div>
        </div>
    )
}

export default About
