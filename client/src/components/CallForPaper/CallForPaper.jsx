import React, { useState } from 'react';
import img1 from '../../assets/img1.jpg';
import img2 from '../../assets/img2.jpg';
import img3 from '../../assets/img3.jpg';
import img4 from '../../assets/img4.jpg';

function CallForPaper() {
  const [activeTrack, setActiveTrack] = useState(null);

  const tracks = [
    {
      title: "Track 1: Advances and Applications in Artificial Intelligence",
      items: [
        "AI Algorithms and Architectures",
        "Natural Language Processing and Text Analytics",
        "AI in Healthcare and Medicine",
        "AI in Finance and Economic Modeling",
        "AI for Social Good and Sustainable Development",
        "Model Interpretability and Explainable ML",
        "Applications of ML in IoT, Cybersecurity, and Autonomous Vehicles",
        "Real-Time Data Processing and Stream Analytics",
        "Scalable Machine Learning with Big Data",
        "Big Data Analytics in Science, Society, and Health",
        "Privacy, Security, and Governance in Big Data",
        "Blockchain for a Connected and Secure Future",
        "Predictive and Prescriptive Analytics",
        "Data Visualization Techniques and Tools",
        "Sentiment Analysis and Opinion Mining",
        "Social Network Analysis and Community Detection",
        "Business Intelligence and Decision Support Systems",
        "AI and ML in Smart Cities and Urban Planning",
        "AI and ML for Environmental Monitoring and Sustainability",
        "Intelligent Systems for IoT",
        "Environmental Monitoring",
        "Sensor, Wireless Technologies, and APIs",
        "Emerging IoT"
      ]
    },
    {
      title: "Track 2: Communication in the Digital Age using AI",
      items: [
        "5G, 6G, and Beyond Networks",
        "Wireless Sensor Networks",
        "Wireless and Optical Communication",
        "Underwater and Underground Communication Networks",
        "Satellite Communication Systems",
        "MIMO, OFDM, and Antenna Design",
        "Mobile ad-hoc networks",
        "Software-defined networks",
        "Wearable network and systems",
        "Next Generation Networking",
        "Quantum Networking",
        "Telecommunication Services and Applications"
      ]
    }
  ];  

  const tracks2 = [
    {
      title: "Track 1: Innovation in Communication/Electronics/Electrical/Wireless/Optical Networks and Security sensors",
      items: [
        "5G, 6G, and Beyond Networks", "Wireless Sensor Networks", "Wireless and Optical Communication",
        "Underwater and Underground Communication Networks", "Satellite Communication Systems",
        "MIMO, OFDM, and Antenna Design", "Microelectronics, Nanoelectronics, and Embedded Systems",
        "Renewable and Sustainable Energy", "Power Systems and Smart Grid", "Mobile ad-hoc networks",
        "Software-defined networks", "Wearable network and systems", "Vehicular networks and applications",
        "Virtual and overlay networks", "Next Generation Networking", "Quantum Networking",
        "QoS Provisioning and Architecture", "Telecommunication Services and Applications",
        "Network Performance", "Computer Security", "Cognitive Radio and Dynamic Spectrum Access"
      ],
      image: img2
    },
    {
      title: "Track 2: Innovative Computing, Robotics, Next-generation IOT and Industrial Automation with Computational Intelligence",
      items: [
        "Quantum Computing and Algorithms",
"High-Performance Computing and Parallel Processing",
"Edge and Fog Computing Architectures",
"Cloud Computing and Distributed Systems",
"Blockchain and Distributed Ledger Technologies",
"Human-Computer Interaction",
"Virtualization and Containerization Technologies",
"Data Structures, Algorithms, and Optimization Techniques",
"Autonomous Robots and Intelligent Systems",
"Human-Robot Interaction",
"Swarm Robotics and Multi-Agent Systems",
"Robotic Vision and Sensing Technologies",
"Collaborative Robots and Industrial Automation",
"Robot Navigation, Planning, and Control",
"Soft Robotics and Bio-inspired Robotics",
"Applications of Robotics in Healthcare, Agriculture, and Manufacturing",
"IoT Architectures, Protocols, and Standards",
"Smart Sensors and Actuators",
"IoT Security, Privacy, and Trust",
"IoT in Smart Cities and Urban Planning",
"Industrial IoT (IIoT) and Smart Manufacturing",
"Intelligent Manufacturing Systems and Industry 4.0",
"Cyber-Physical Systems (CPS) and Industrial Internet of Things (IIoT)",
"Predictive Maintenance and Condition Monitoring",
"Advanced Process Control and Optimization",
"Real-Time Monitoring and Control Systems",
"Fuzzy Logic and Expert Systems",
"Evolutionary Computation and Genetic Algorithms",
"Neural Networks and Artificial Intelligence in Control Systems",
"Bio-inspired Computing and Algorithms",
"Intelligent Decision Support Systems",
"Knowledge Representation and Reasoning",
"Computational Intelligence in IoT and Robotics",
"Safety-Critical System Design and Validation",
"Secure Communication Protocols in IoT and Robotics",
"Privacy-Preserving Algorithms for Industrial Data",
"Resilience and Reliability in Industrial Automation",
"Cyber-Physical Security in Smart Factories",
"Biomedical computing"
      ],
      image: img3
    },
    {
      title: "Track 3: Artificial Intelligence, Machine Learning, Big data, Blockchain and Analytics",
      items: [
        "AI Algorithms and Architectures", "Natural Language Processing and Text Analytics",
        "Image Processing", "AI in Healthcare and Medicine", "Autonomous Systems and Robotics",
        "AI in Finance and Economic Modeling", "AI for Social Good and Sustainable Development",
        "Model Interpretability and Explainable ML", "ML for Time Series Analysis and Forecasting",
        "Anomaly Detection and Predictive Maintenance",
        "Applications of ML in IoT, Cybersecurity, and Autonomous Vehicles",
"Real-Time Data Processing and Stream Analytics",
"Data Warehousing, ETL, and Data Lakes",
"Scalable Machine Learning with Big Data",
"Big Data in social media and Network Analysis",
"Privacy, Security, and Governance in Big Data",
"Big Data Architecture and Frameworks",
"Blockchain in Finance and Cryptocurrency",
"Integration of Blockchain with IoT and AI",
"Blockchain for Supply Chain and Logistics",
"Blockchain for Healthcare and Identity Management",
"Energy-Efficient Blockchain Technologies",
"Data Mining and Knowledge Discovery",
"Predictive and Prescriptive Analytics",
"Data Visualization Techniques and Tools",
"Sentiment Analysis and Opinion Mining",
"Social Network Analysis and Community Detection",
"Business Intelligence and Decision Support Systems",
"AI and ML in Smart Cities and Urban Planning",
"Big Data and Analytics in Healthcare and Medicine",
"Blockchain Applications in Government and Public Services",
"AI and ML for Environmental Monitoring and Sustainability",
"Big Data in Genomics and Bioinformatics",
"Intelligent Systems for IoT",
"Environmental Monitoring",
"Sensor, Wireless Technologies, and APIs",
"Emerging IoT"
        
        // ... (rest of the items from the original component)
      ],
      image: img4
    }
  ];

  const toggleTrack = (index) => {
    setActiveTrack(activeTrack === index ? null : index);
  };

  return (
    <div className="w-full px-4 py-6 bg-white">
      <div className="max-w-7xl mx-auto bg-gray-50 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-800">
            CALL FOR PAPER
          </h1>

          {/* Conference Description */}
          <div className="flex flex-col-reverse md:flex-row items-center mb-6 gap-4">
            <div className="flex-1 text-gray-700 text-base sm:text-lg text-justify">
              <p>
                The objective of the IETACS-2025 an International Conference On Innovations And Emerging Technologies In AI & Communication Systems is to provide a global forum for researchers, practitioners, industry experts, and academicians to present and discuss the latest advancements, challenges, and innovations in the fields of emerging technologies and intelligent systems. 
              </p>
            </div>
            <div className="w-full md:w-1/3 flex-shrink-0">
              <img 
                src={img1} 
                alt="Innovative Computing" 
                className="w-full h-auto object-cover rounded-lg shadow-md"
              />
            </div>
          </div>

          {/* Technical Tracks Section */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-gray-800">
              TECHNICAL TRACKS
            </h2>
            <p className="text-gray-700 mb-4">
              IEEE - IETACS-2025 an International Conference On Innovations And Emerging Technologies In AI & Communication Systems - Invites original and unpublished manuscripts for submission in the following tracks (but not limited to):
            </p>

            {tracks.map((track, index) => (
              <div key={index} className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-100 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={() => toggleTrack(index)}
                >
                  <h3 className="font-semibold text-base sm:text-lg">
                    {track.title}
                  </h3>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-6 w-6 transform transition-transform ${activeTrack === index ? 'rotate-90' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {activeTrack === index && (
                  <div className="flex flex-col-reverse md:flex-row p-4 gap-4">
                    <ul className="flex-1 space-y-2 list-disc pl-5 text-gray-700">
                      {track.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-sm sm:text-base">
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="w-full md:w-1/3 flex-shrink-0">
                      <img 
                        src={track.image} 
                        alt={`Track ${index + 1} Illustration`} 
                        className="w-full h-auto object-cover rounded-lg shadow-md"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CallForPaper;