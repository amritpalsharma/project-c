import React from "react";
import CGCimage from "../../assets/CGC-image.png";
import CSBimage from "../../assets/CGC-image.png";


function About() {
  return (
    <div >
      <div>
  <div className="pt-20 sm:pt-10 flex justify-center">
    <h1 className="text-red-600 mb-0 text-center text-2xl sm:text-3xl md:text-4xl font-bold">
      CHANDIGARH ENGINEERING COLLEGE
    </h1>
  </div>
</div>
      <div className="flex flex-wrap">
        <div className="w-full md:w-auto">
          <img src={CGCimage} alt="CGC Jhanjeri" className="w-full md:w-auto" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center mt-10 p-4">
        <div className="md:w-2/3">
          <h2 className=" text-2xl font-extrabold text-center mb-5">
            ABOUT THE INSTITUTE
          </h2>
          <div className="p-5 mt-10 text-justify bg-gray-100 rounded-md">
            <p>
            Established in 2012 with engineering as its flagship program, Chandigarh Engineering College, Jhanjeri (CEC-J), accredited with a NAAC A+ rating, has made significant strides in providing quality higher education at affordable costs. CEC-J, with origins tracing back to 2001 as part of the CEC Group, has emerged as one of North India’s premier higher education institutions, offering world-class education and extensive placement opportunities to students from across the country. CEC-J stands out for its strong international partnerships, having forged alliances with over 50 leading international colleges and universities across 25 countries. These collaborations provide our students with the chance to expand their global perspectives. The college is home to experienced faculty, many of whom are alumni of IITs, NITs and IIMs, and fosters a student-centric, research-driven environment. Our educational approach effectively combines theoretical knowledge with practical experience. In addition, CEC-J places great emphasis on comprehensive pre-placement training and has built robust industry-academia partnerships, making us leaders in campus placements. We have established connections with top-tier companies across various sectors to stay aligned with industry trends and implement an industry-relevant curriculum.
            </p>
            <div className="pt-5">
              <p>
                <span className="font-extrabold">VISION OF THE INSTITUTE:</span> To emerge as an Institution of Technical excellence imparting professional education for sustainable development of society
              </p>
              <p>
  <span className="font-extrabold">MISSION OF THE INSTITUTE:</span>
</p>
<ul className="list-disc pl-5">
  <li>To provide quality technical education through state-of-the-art infrastructure and well qualified and experienced faculty.</li>
  <li>Having academic flexibility through strong industry-academia interactions.</li>
  <li>Focus on students' employability, entrepreneurship, higher education and competitive examinations.</li>
  <li>Inculcate ethical and moral values in students.</li>
</ul>
            </div>
          </div>
        </div>
        <div className="md:w-1/3 mt-5 md:mt-0 md:ml-5">
          <img
            src={CSBimage} alt="Institute Image" className="w-full h-auto rounded-md shadow-md"
          />
        </div>  
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center mt-10 p-4">
  <div className="md:w-1/3  md:mt-0 md:mr-5">
    <img
      src={CGCimage}
      alt="Conference Image"
      className="hidden sm:block w-full h-auto rounded-md shadow-md"
    />
  </div>
  <div className="md:w-2/3">
    <h2 className="text-2xl font-extrabold text-center mb-5">
      ABOUT THE CONFERENCE
    </h2>
    <div className="p-5  text-justify  rounded-md">
      <p>
        The objective of the
        {" "}
        <strong>
        IETACS-2025 an International Conference On Innovations And Emerging Technologies In AI & Communication Systems
        </strong>{" "}
        is to provide a global forum for researchers, practitioners, industry experts, and academicians to present and discuss the latest advancements, challenges, and innovations in the fields of emerging technologies and intelligent systems. The conference aims to facilitate the exchange of knowledge, foster interdisciplinary collaboration, and explore the integration of intelligent systems with emerging technologies to address complex global challenges.
      </p>
      
    </div>
    <div className="md:w-1/3  md:mt-0 md:mr-5">
    <img
      src={CGCimage}
      alt="Conference Image"
      className="block sm:hidden w-full h-auto rounded-md shadow-md"
    />
  </div>
  </div>
</div>
     
    </div>
  );
}
export default About;
