
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";

  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

  import { getDatabase, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

  import { getFirestore, writeBatch, collection, query, where, doc, getDocs, setDoc, getDoc, addDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
  import { getStorage, ref, uploadString, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-storage.js";

var key = "b76x864283b7rztsyvb0x972475bx87tgfd3t54hd8456yu3bd7t34tfbyd2ygd2ty64dtvvcbuywedr36423egd3i7";
  
  const firebaseConfig = {
    apiKey: CryptoJS.AES.decrypt('U2FsdGVkX19svOuGSoPeLHFc9E/sf/r+Qyn9bsfafHm56eN6uiv9CzzJzpTk8KnOszEaFb7Y2UKT+7ownxTnZg==', key).toString(CryptoJS.enc.Utf8),
    authDomain: CryptoJS.AES.decrypt('U2FsdGVkX1/BZHo3IJDmhh6GJylMpUT6lgbY8dsEWAoITzqUcHhMVL6WoWKga9+EKXS9NLZq6KMCSBpPTleBIA==', key).toString(CryptoJS.enc.Utf8),
    databaseURL: CryptoJS.AES.decrypt('U2FsdGVkX1/OOdZc+tJlzxdPvKYlzhuhSePRNwo9s7SU62UyAF8LEgAU6vzEJjuRh8pbxd4LUaZuqc+xNSzCWfJ2E28weGYvsYCXSmVhh6MHJwDIoAJOTTGbM9t1GqNq', key).toString(CryptoJS.enc.Utf8),
    projectId: CryptoJS.AES.decrypt('U2FsdGVkX1+SsATt86I3jP1pqjtsUX3m/mdFVBtkQgR+zzQNPHnPDAarTfQ5tYWS', key).toString(CryptoJS.enc.Utf8),
    storageBucket: CryptoJS.AES.decrypt('U2FsdGVkX1+e9OOYo4t1737HNNYqdlHbRMiZF+aiflOqmDp9D301hu/PHgb2Z+xI4dNtU8p5m+RR6nXqjdhpNA==', key).toString(CryptoJS.enc.Utf8),
    messagingSenderId: CryptoJS.AES.decrypt('U2FsdGVkX18XaZStTxoYBuSS2bmvPC4FP9rq+8/TcSI=', key).toString(CryptoJS.enc.Utf8),
    appId: CryptoJS.AES.decrypt('U2FsdGVkX18mqBkWktxVelHmks9bsf58fGndOm0U7T0Eup+yPLtGexPLj+eT6zomG1wV4+YCd5MzTQIneiayzw==', key).toString(CryptoJS.enc.Utf8)
  };

    const app = initializeApp(firebaseConfig);
    const database = getFirestore();  
    const storage = getStorage();
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

const $ = (id) => {
    return document.getElementById(id);
}

var state = {

    // _jobViewState : {
    //     isJobListInView : true,
    //     isJobDescInView : false,
    //     viewPortBp: 'lg'
    // }

    _userAuthState :{
        isAuth: false,
        showLoginBtn: true,
        showProfilePic: false,
        showLogoutBtn: false
    },

    _user:{
        name: '',
        photoURL: '',
        email: '',
        _data : {}
    },

    _jobs:{
        isViaSearch: false,
        isViaInitial: true,
        isViaSaved: false,
        isViaApplied: false,
        data: [],
        searchQp: ''
    },

    _query: ''
}

// Object.defineProperty(state, "_jobViewState", {
//     set: (changed) => {
        // console.log(state)
//     }
// })

let viewPortBreakPoint = {
    lg : 825
}

const toggleJobView = (ctx) => {
    let currentCtx = ctx.srcElement.attributes['data-ctx'].nodeValue;

    if(currentCtx === 'expand_jd'){
        if(state._jobViewState.viewPortBp === 'sm'){

            let newJobViewState = {
                isJobListInView: false,
                isJobDescInView: true,
                viewPortBp: 'sm'
            }

            state._jobViewState = newJobViewState;
        }

        let dataJobId = ctx.srcElement.attributes['data-job-id'].nodeValue;
        renderJobDesc(dataJobId)

    }
    else if(currentCtx === 'collapse_jd'){
        if(state._jobViewState.viewPortBp === 'sm'){

            let newJobViewState = {
                isJobListInView: true,
                isJobDescInView: false,
                viewPortBp: 'sm'
            }

            state._jobViewState = newJobViewState;
        }
    }

    renderJobView();
}

const renderJobView = () => {
    // console.log(state)

    let isJdInView = state._jobViewState.isJobDescInView
    let isJlInView = state._jobViewState.isJobListInView

        $('jd').style.display = isJdInView ? 'block' : 'none';
        $('jl').style.display = isJlInView ? 'block' : 'none';
        
        if(isJdInView) $('jd').style.flexGrow = 1;
        if(isJlInView) $('jl').style.flexGrow = 1;

}



const searchInputChange = async(event) => {
    state._query = event.target.value; 
    if(event.keyCode === 13){
       await fetchSearchByQueryJobsData();
    }   
}

const fetchSearchByQueryJobsData = async() => {


// await fetck();


    // if((state._jobs.isViaSearch === true && state._jobs?.data?.length === 0) || state._jobs.isViaSearch == false){
        // console.log('state data for search jobs is empty, fetching from db')
        let allJobsList = [];
        let searchedJobsList = [];

        let _allJobsList = localStorage.getItem('_search_jobs_raw_data');
        if(_allJobsList != null){
            // console.log('fetched master search data from cache hit')
            allJobsList = JSON.parse(_allJobsList)
        }else{
            // console.log('fetched master search data from db')
            const jobsCollection = collection(database, 'jobs');
            // const q = query(jobsCollection, where('isFeatured', '==', true))
            const querySnapshot = await getDocs(jobsCollection);

            // try to unsub from the snapshot listener
            // const unsub = onSnapshot(collection(database, 'jobs'), (doc) => {
                // console.log(doc)
            //     if(doc)
            //     allJobsList.push(
            //         {id: doc.id, ...doc.data()})
            // })


            // unsub();


            querySnapshot.forEach((doc) => {
                if(doc)
                allJobsList.push(
                    {id: doc.id, ...doc.data()})
            })

            // can toggle on/of to store master data in ls
            // if(allJobsList.length > 0)
            // localStorage.setItem("_search_jobs_raw_data", JSON.stringify(allJobsList))
        }

        // console.log(allJobsList)
        allJobsList.forEach((job) => {
            let skills = job.skillTags;
            skills = skills.map((value) => {return value.toLowerCase()})
            if(job.jobName.toString().toLowerCase().includes(state._query.toLowerCase()) 
                || skills.includes(state._query.toLowerCase()) 
                || job.company.toString().toLowerCase().includes(state._query.toLowerCase())
                || job.location.toString().toLowerCase().includes(state._query.toLowerCase())
            ){
                searchedJobsList.push(job)
            }
        })

        if(searchedJobsList.length === 0){
            $('jd').innerHTML = '';
            createToast('feedback', 'Result', new Date(), 'No Data found for the search Query '+ state._query, false)
        }

        let _jobs = state._jobs;
        _jobs.isViaSearch = true;
        _jobs.isViaInitial = false;
        _jobs.isViaSaved = false;
        _jobs.isViaApplied = false
        _jobs.data = searchedJobsList;

        setJobsState(() => {
            state._jobs = _jobs;
        })
        localStorage.setItem('jobs', JSON.stringify(_jobs))

    // }
    // else if(state._jobs.isViaSearch === true && state._jobs?.data?.length > 0){
        // console.log('state data for search jobs is retreived from cache hit')
    //     let _jobs = state._jobs;
    //     _jobs.isViaSearch = true;
    //     _jobs.isViaInitial = false
    //     setJobsState(() => {
    //         state._jobs = _jobs
    //     })
    // }

    // console.log(state)

}


$('expand_jd')?.addEventListener('click', toggleJobView);
$('collapse_jd')?.addEventListener('click', toggleJobView);
$('searchInput').addEventListener('keyup', searchInputChange);
$('searchBtn')?.addEventListener('click', fetchSearchByQueryJobsData);

searchBtn


const getJobViewStateBasedOnViewPortBp = (breakPoint) => {

    let newJobViewState = {};

    if(breakPoint === 'lg' ){
        newJobViewState.isJobDescInView =  true ;
        newJobViewState.isJobListInView =  true;
        newJobViewState.viewPortBp = breakPoint;
    }
    else if(breakPoint === 'sm'){
        newJobViewState.isJobDescInView =  false;
        newJobViewState.isJobListInView = true;
        newJobViewState.viewPortBp = breakPoint;
    }

    return newJobViewState;
}

const setJobViewState = () => {

    let newJobViewState;
    
    let currentViewPortWidth = window.innerWidth;
    if(currentViewPortWidth >= viewPortBreakPoint.lg){
        newJobViewState = getJobViewStateBasedOnViewPortBp('lg')
    }else{
        newJobViewState = getJobViewStateBasedOnViewPortBp('sm')
    }


    state._jobViewState = newJobViewState;
    renderJobView();


}

const fetck = async() => {
let fetchedUser = {}
    const usersCollection = collection(database, collectionNameForUsersDb, state._user.email);
        const querySnapshot = await getDocs(usersCollection);
        querySnapshot.forEach((doc, index) => {
            if(doc.id === state._user.email){
                // console.log(index,': fetched user data related to jobs with id: ', doc.id)
                fetchedUser = {id: doc.id, ...doc.data()}
                state._user._data = fetchedUser
            }
        })

        if(state._user._data.resume === true){
            $('resume-uploaded-container').style.display = 'block';
            $('resume-upload-container').style.display = 'none';
            $('view-resume-btn').href = state._user._data.resumeFileMetaData;
        
            $('re-upload-resume-btn').addEventListener('click', () => {
                $('resume-uploaded-container').style.display = 'none';
                $('resume-upload-container').style.display = 'block';
            })
        }
    
    // const unsub = onSnapshot(doc(database, collectionNameForUsersDb, state._user.email), (doc) => {
    //     fetchedUser = { id: doc.id, ...doc.data()};
    //     state._user._data = fetchedUser
    // })
    // unsub();

    }

const fetchInitialJobsData = async() => {

    coseSideNav();

// await fetck();

    // if(state._jobs?.data?.length === 0){

        // console.log('state data for jobs is empty, fetching from db')

        let featuredJobsList = [];
        const jobsCollection = collection(database, 'jobs');
        const q = query(jobsCollection, where('isFeatured', '==', true))
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            if(doc)
            featuredJobsList.push(
                {id: doc.id, ...doc.data()})
        })
         let _jobs = state._jobs;
        _jobs.data = featuredJobsList;
        setJobViewStatusByKey('initial');
        setJobsState(()=> {
            state._jobs = _jobs
        })

        localStorage.setItem('jobs', JSON.stringify(_jobs))


        // const addRef = await addDoc(collection(database, 'jobs'), {
        //     "aboutCompany": "Amazon drives progress. Our firms around the world help clients become leaders wherever they choose to compete. Amazon invests in outstanding people of diverse talents and backgrounds and empowers them to achieve more than they could elsewhere. Our work combines advice with action and integrity. We believe that when our clients and society are stronger, so are we.  Amazon refers to one or more of Amazon Touche Tohmatsu Limited (“DTTL”), its global network of member firms, and their related entities. DTTL (also referred to as “Amazon Global”) and each of its member firms are legally separate and independent entities. DTTL does not provide services to clients. Please see www.Amazon.com/about to learn more.",
        //     "expMax": 3,
        //     "jobDescription": "Independently develops error free code with high quality validation of applications guides other developers and assists Lead 1 – Software Engineering",
        //     "location": "Pune",
        //     "preferredQual": [
        //         "Masters Degree with any recognized Institution.",
        //         "Working experience in any Intership or a full time position.",
        //         "Expertise in Spring Boot along with latest java version."
        //     ],
        //     "postingDate": {
        //         "seconds": 1699023790,
        //         "nanoseconds": 596000000
        //     },
        //     "isFeatured": true,
        //     "length": "Full time",
        //     "expMin": 0,
        //     "company": "Amazon",
        //     "jobName": "Application Architect",
        //     "skillTags": [
        //         "AWS",
        //         "Lamda",
        //         "Java",
        //         "Microservices",
        //         "Cloud",
        //         "Spring Boot"
        //     ],
        //     "requiredQual": [
        //         "Bachelors Degree from a recognnized university with minimum 70% marks.",
        //         "Sound knowledge in any Object Oriented Programming Language",
        //         "Hands on working experience with real life usecases."
        //     ],
        //     "jobId": 1
        // });

        // console.log(addRef.id)

    // }else{
        // console.log('state data for jos is retreived from cache hit')
    //     setJobsState(() => {})
    // // }

    $('searchInput').value = '';

}

$('homeBtnNav').addEventListener('click', fetchInitialJobsData);
$('homeBtnMenu').addEventListener('click', fetchInitialJobsData);

const batch = writeBatch(database);

const loadData = async() => {

    var data = [
        {
            "aboutCompany": "At IBM, work is more than a job - it's a calling: To build. To design. To code. To consult. To think along with clients and sell. To make markets. To invent. To collaborate. Not just to do something better, but to attempt things you've never thought possible. Are you ready to lead in this new era of technology and solve some of the world's most challenging problems? If so, lets talk.",
            "expMax": 10,
            "jobDescription": "AIX is the leading open standards-based UNIX operating system from IBM that provides scalable, secure, and robust infrastructure solution for enterprise customers. As a AIX developer you will be working on new enhancements in RAS features and Performance tool enhancements.",
            "location": "Bangalore",
            "preferredQual": [
                "Minimum 5 years relevant experience in implementing and managing Saviynt IGA solution.",
                "Knowledge on User Lifecycle Management, Provisioning, Deprovisioning, Reconciliation, Password management, Access Certification, RBAC, SOD, Role Management, Access Request, Delegation, Auditing, Reporting and user activity Monitoring",
                "Experience in MySQL and Unix Shell/Perl scripting",
                "Knowledge of Web Services (REST/SOAP), Directories (LDAP, AD), etc."
            ],
            "postingDate": {
                "seconds": 1701234259,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 5,
            "company": "IBM",
            "jobName": "AIX DEVELOPER",
            "skillTags": [
                "Unix",
                "HPUX",
                "AIX",
                "linux",
                "solaris",
                "Spring Boot"
            ],
            "requiredQual": [
                "Design. Implement and Manage Saviynt IGA solution",
                "Strong knowledge of Saviynt and hands of experience of Saviynt implementation",
                "Solid understanding of Microsoft Windows Server operating systems, Active Directory, and LDAP Experience with IIS and"
            ],
            "jobId": 3
        },
        {
            "aboutCompany": "UST is a global digital transformation solutions provider. For more than 20 years, UST has worked side by side with the world's best companies to make a real impact through transformation. Powered by technology, inspired by people and led by purpose, UST partners with their clients from design to operation. With deep domain expertise and a future-proof philosophy, UST embeds innovation and agility into their clients organizations. With over 30,000 employees in 30 countries, UST builds for boundless impact—touching billions of lives in the process.",
            "expMax": 7,
            "jobDescription": "Develop applications in assigned area of responsibility on ERP/CRM systems with minimal guidance from a Lead Developer Contribute to ERP/CRM Practice related activities like (but not limited to) assembling content for case studies contributing to reusability coordinating internal seminars and conduct knowledge sharing sessions organizing sessions during and participating in hackathons etc. ",
            "location": "Bangalore",
            "preferredQual": [
                "Masters Degree with any recognized Institution.",
                "Working experience in any Intership or a full time position.",
                "Expertise in Spring Boot along with latest java version."
            ],
            "postingDate": {
                "seconds": 1701147859,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 3,
            "company": "UST",
            "jobName": "Developer ||| - Enterprise Solutions",
            "skillTags": [
                "DBMS",
                "Agile",
                "IDL",
                "RAD",
                "Cloud",
                "SDLC"
            ],
            "requiredQual": [
                "Bachelors Degree from a recognnized university with minimum 70% marks.",
                "Sound knowledge in any Object Oriented Programming Language",
                "Hands on working experience with real life usecases."
            ],
            "jobId": 4
        },
        {
            "aboutCompany": "Wipro Limited (NYSE: WIT, BSE: 507685, NSE: WIPRO) is a leading technology services and consulting company focused on building innovative solutions that address clients most complex digital transformation needs. Leveraging our holistic portfolio of capabilities in consulting, design, engineering, and operations, we help clients realize their boldest ambitions and build future-ready, sustainable businesses. With nearly 245,000 employees and business partners across 65 countries, we deliver on the promise of helping our clients, colleagues, and communities thrive in an ever-changing world.",
            "expMax": 5,
            "jobDescription": "Lead cross global functional teams in developing finance strategies to support a strategic alignment with  company's Business Operations and Corporate departments on company goals & initiatives. Manage financial goals that result in strong customer satisfaction,with company strategy, and optimize costs and supplier relations. Influence senior leaders in setting direction for their functional areas by costs and supplier relations. Influence senior leaders in setting direction for their functional areas bylinking finance and business strategies to optimize business result",
            "location": "Hyderabad",
            "preferredQual": [
                "Masters Degree with any recognized Institution.",
                "Working experience in any Intership or a full time position.",
                "Expertise in Spring Boot along with latest java version."
            ],
            "postingDate": {
                "seconds": 1701165859,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 2,
            "company": "Wipro",
            "jobName":"Business Analyst",
            "skillTags": [
                "Budgeting",
                "Financial analysis",
                "Problem solving",
                "Risk assessment",
                "Financial planning",
                "Accounting and cash flow management"
            ],
            "requiredQual": [
                "Bachelors Degree from a recognnized university with minimum 70% marks.",
                "Sound knowledge in any Object Oriented Programming Language",
                "Preferably CA with minimum 3-5 years of business finance experience"
            ],
            "jobId": 5
        },
        {
            "aboutCompany": "Every company has a mission. What's ours? To empower every person and every organization to achieve more. We believe technology can and should be a force for good and that meaningful innovation contributes to a brighter world in the future and today. Our culture doesnt just encourage curiosity; it embraces it. Each day we make progress together by showing up as our authentic selves. We show up with a learn-it-all mentality. We show up cheering on others, knowing their success doesn't diminish our own. We show up every day open to learning our own biases, changing our behavior, and inviting in differences. Because impact matters.",
            "expMax": 12,
            "jobDescription": "Dynamics 365 Finance is one of the fastest growing applications in the Dynamics portfolio  the fastest growing SaaS Enterprise Resource Planning (ERP) portfolio in the world. We specialize in best-in-class solutions enabling businesses to run their end-to-end financial operations for the Dynamics 365 line of ERP software. We aim to enable managers and finance professionals to effectively run their business using the Dynamics 365 products. We have a mission to be the most innovative and trusted solution on the market incorporating the latest in artificial intelligence, automation and integrated analytics leveraging the breadth of Microsoft Azure, Office, Teams, Dynamics and the Power Platform to continually meet the growing needs of businesses in a fast-moving environment.",
            "location": "Kolkata",
            "preferredQual": [
                "Excellent communication, collaboration, and problem-solving skills.", 
    "Ability to work independently and as part of a team in a fast-paced and dynamic environment. ",
    "Passion for learning new skills and technologies and sharing them with others. "
            ],
            "postingDate": {
                "seconds": 1701252259,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 8,
            "company": "Microsoft",
            "jobName": " Sr. Project Manager",
            "skillTags": [
                "Technical skills",
                "Roadmapping",
                "Communication skills",
                "Forecasting",
                "Data analytics",
                "Reaserch skills"
            ],
            "requiredQual": [
                "Bachelor's Degree in Computer Science, or related technical discipline AND 4+ years technical engineering experience with coding in languages including, but not limited to, C, C++, C#, Java, JavaScript, or Python OR equivalent experience. ",
                "Background on .NET Core and Framework would be an added advantage." ,
    "Experience on Databases like Cosmos/CDS services would be preferred. "
            ],
            "jobId": 6
        },
        {
            "aboutCompany": "A part of the Tata group, India's largest multinational business group, TCS has over 500,000 of the world's best-trained consultants in 46 countries. The company generated consolidated revenues of US $22.2 billion in the fiscal year ended March 31, 2021, and is listed on the BSE (formerly Bombay Stock Exchange) and the NSE (National Stock Exchange) in India.",
            "expMax": 10,
            "jobDescription": "TCS has been a great pioneer in feeding the fire of young techies like you. We are a global leader in the technology arena and there's nothing that can stop us from growing together.",
            "location": "new delhi",
            "preferredQual": [
               "Proficiency in scripting languages (e.g., JavaScript, Groovy, Powershell) for customization and automation.",
                "Understanding of security standards such as OAuth, open ID Connect, SAML and LDAP.",
                "Excellent problem -solving and troubleshooting skills.","Strong communication and teamwork abilities."
            ],
            "postingDate": {
                "seconds": 1701079459,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 7,
            "company": "TCS",
            "jobName": "Power BI Analyst",
            "skillTags": [
                "SIT",
                "UAT support",
                "Hypercare support",
                "CRM",
                "Key user training",
                "Functional testing"
            ],
            "requiredQual": [
               " Bachelor's degree in Computer science, Information Technology or a related field.",
    "Proven experience in implementing ForgeRock IDM solutions.",
    "Strong knowledge of identity and access management concepts and best practices"
            ],
            "jobId": 7
        },
        {
            "aboutCompany": "KPMG entities in India are established under the laws of India and are owned and managed (as the case may be) by established Indian professionals. Established in September 1993, the KPMG entities have rapidly built a significant competitive presence in the country. Today we operate from offices across 14 cities including in Ahmedabad, Bengaluru, Chandigarh, Chennai, Gurugram, Hyderabad, Jaipur, Kochi, Kolkata, Mumbai, Noida, Pune, Vadodara and Vijayawada.",
            "expMax": 6,
            "jobDescription": "KPMG entities in India are professional services firm(s). These Indian member firms are affiliated with KPMG International Limited. KPMG was established in India in August 1993. Our professionals leverage the global network of firms, and are conversant with local laws, regulations, markets and competition. KPMG has offices across India in Ahmedabad, Bengaluru, Chandigarh, Chennai, Gurugram, Hyderabad, Jaipur, Kochi, Kolkata, Mumbai, Noida, Pune, Vadodara and Vijayawada.",
            "location": "chandigarh",
            "preferredQual": [
                "Possess solid creative, social and web knowledge, consistently bringing innovative solutions and delivering client service excellence.",
    "Excellent production skills, proper file setup and style sheet builds."
            ],
            "postingDate": {
                "seconds": 1700993059,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 3,
            "company": "KPMG India",
            "jobName": "Consultant - SIAM SIAM",
            "skillTags": [
                "SIAM",
                "ITIL V4",
                "E2E",
                "MS Office",
                "professionalism",
                "InDesign",
                "Illustrator",
                "Photoshop"
            ],
            "requiredQual": [
                "Minimum 5-8 years of design experience in conceptualization, solution development, campaign execution and client relationship management.",
                "A strong portfolio showcasing a range of complex visualizations and the ability to explain the thought process behind them."
    
            ],
            "jobId": 8
        },
        {
            "aboutCompany": "IBM greatest invention is the IBMer. We believe that through the application of intelligence, reason and science, we can improve business, society and the human condition, bringing the power of an open hybrid cloud and AI strategy to life for our clients and partners around the world.Restlessly reinventing since 1911, we are not only one of the largest corporate organizations in the world, were also one of the biggest technology and consulting employers, with many of the Fortune 50 companies relying on the IBM Cloud to run their business. At IBM, we pride ourselves on being an early adopter of artificial intelligence, quantum computing and blockchain. Now its  time for you to join us on our journey to being a responsible technology innovator and a force for good in the world. ",
            "expMax": 6,
            "jobDescription": " At IBM, work is more than a job - it's a calling: To build. To design. To code. To consult. To think along with clients and sell. To make markets. To invent. To collaborate. Not just to do something better, but to attempt things you've never thought possible. Are you ready to lead in this new era of technology and solve some of the world's most challenging problems? If so, lets talK",
            "location": "Pune",
            "preferredQual": [
                "Good working knowledge on Windows, UNIX.",
    "Experience of writing code to target high performance server and client-side environments.",
    "Familiarity with UI Test Case Automation like Selenium, Jenkins.",
    "Knowledge on addressing Security Vulnerabilities.",
    "Knowledge on Cluster Environments with large scale applications, load balancers.",
    "Good working knowledge on the following areas will be added advantage: Continuous Integration: Jenkins",
    "Protocols/Specification and Languages: Http, JSON, XML, JavaScript/HTML5/CSS, DOJO"
            ],
            "postingDate": {
                "seconds": 1701252259,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 3,
            "company": "IBM",
            "jobName": "Full Stack Developer",
            "skillTags": [
                "IBM’s Cloud",
                "UNIX",
                "GraphQL",
                "Microservices",
                "WatsonX/AI",
                "Spring Boot"
            ],
            "requiredQual": [
                "3 + years of industry experience",
    "Front-end: Javascript, HTML, CSS, ReactJS, NodeJS",
    "Backend: Python, Java, GraphQL, Java/J2EE, REST, Docker, Linux"
    
            ],
            "jobId": 9
        },
        {
            "aboutCompany": "Capgemini is a global leader in partnering with companies to transform and manage their business by harnessing the power of technology. The Group is guided everyday by its purpose of unleashing human energy through technology for an inclusive and sustainable future. It is a responsible and diverse organization of 350,000 team members in more than 50 countries. With its strong 55-year heritage and deep industry expertise, Capgemini is trusted by its clients to address the entire breadth of their business needs, from strategy and design to operations, fueled by the fast evolving and innovative world of cloud, data, AI, connectivity, software, digital engineering and platforms. The Group reported in 2022 global revenues of €22 billion.",
            "expMax": 3,
            "jobDescription": "Producing high quality code without much supervision and on-time delivery troubleshooting, diagnosing resolving customer issues independently Prepare solution design documents and develop framework for automation scripting-based processes., ",
            "location": "Pune",
            "preferredQual": [
                "Masters Degree with any recognized Institution.",
                "Working experience in any Intership or a full time position.",
                "Expertise in Spring Boot along with latest java version."
            ],
            "postingDate": {
                "seconds": 1701165859,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 0,
            "company": "Capgemini",
            "jobName": "Devops Engineer",
            "skillTags": [
                "Cloud",
                "DevOps",
                "Splunk",
                "Microservices",
                "Cloud",
                "Zookeeper"
            ],
            "requiredQual": [
                "Bachelors Degree from a recognnized university with minimum 70% marks.",
                "Sound knowledge in any Object Oriented Programming Language",
                "Hands on working experience with real life usecases."
            ],
            "jobId": 10
        },
        {
            "aboutCompany": "Tata Steel has been a part of the DJSI Emerging Markets Index since 2012 and has been consistently ranked amongst top 5 steel companies in the DJSI Corporate Sustainability Assessment since 2016. Besides being a member of ResponsibleSteelTM and worldsteel's Climate Action Programme, Tata Steel has won several awards and recognitions including the World Economic Forum's Global Lighthouse recognition for its Kalinganagar Plant - a first in India, and Prime Ministers Trophy for the best performing integrated steel plant for 2016-17. The Company, ranked as India's most valuable Metals & Mining brand by Brand Finance, received the Honourable Mention at the National CSR Awards 2019, Steel Sustainability Champion 2019 by worldsteel, CII Greenco Star Performer Award 2019,Most Ethical Company award 2020 from Ethisphere Institute, Best Risk Management Framework & Systems Award (2020) by CNBC TV-18, and Award for Excellence in Financial Reporting FY20 by ICAI, among several others.",
            "expMax": 10,
            "jobDescription": "o investigate cases of ethical misconduct, especially through digital forensic investigation, identify internal control gaps in business processes and systems that provide scope for malpractices, proactive studies to identify ethical concerns, and organize vigilance awareness programs. Work as the IT resource for the Vigilance Department.",
            "location": "Jamshedpur",
            "preferredQual": [
                "Masters Degree with any recognized Institution.",
                "Working experience in any Intership or a full time position.",
                "Expertise in Spring Boot along with latest java version."
            ],
            "postingDate": {
                "seconds": 1700993059,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 7,
            "company": "TATA steel",
            "jobName": "Area Manager ",
            "skillTags": [
                "Team building",
                "Leadership",
                "Domain knowledge",
                "Good orgnization",
                "Communication skills",
                "Area mangement"
            ],
            "requiredQual": [
                "Bachelors Degree from a recognnized university with minimum 70% marks.",
                "Sound knowledge in any Object Oriented Programming Language",
                "Hands on working experience with real life usecases."
            ],
            "jobId": 11
        },
        {
            "aboutCompany": "Amazon drives progress. Our firms around the world help clients become leaders wherever they choose to compete. Amazon invests in outstanding people of diverse talents and backgrounds and empowers them to achieve more than they could elsewhere. Our work combines advice with action and integrity. We believe that when our clients and society are stronger, so are we.  Amazon refers to one or more of Amazon Touche Tohmatsu Limited (“DTTL”), its global network of member firms, and their related entities. DTTL (also referred to as “Amazon Global”) and each of its member firms are legally separate and independent entities. DTTL does not provide services to clients. Please see www.Amazon.com/about to learn more.",
            "expMax": 7,
            "jobDescription": "Independently develops error free code with high quality validation of applications guides other developers and assists Lead 1 - Software Engineering",
            "location": "Hyderabad",
            "preferredQual": [
               "Experience working within software development or Internet-related industries.",
                "Experience migrating or transforming legacy customer solutions to the cloud",
                "Experience working with AWS technologies from a dev/ops perspective"
            ],
            "postingDate": {
                "seconds": 1701079459,
                "nanoseconds": 596000000
            },
            "isFeatured": true,
            "length": "Full time",
            "expMin": 3,
            "company": "Amazon",
            "jobName": "Application Architect",
            "skillTags": [
                "Cloud",
                "Lamda",
                "Networking",
                "Microservices",
                "System Design",
                "Dev/Ops"
            ],
            "requiredQual": [
                "7+ years of specific technology domain areas (e.g. software development, cloud computing, systems engineering, infrastructure, security, networking, data & analytics) experience.",
    " 4+ years of design, implementation, or consulting in applications and infrastructures experience",
    " 10+ years of IT development or implementation/consulting in the software or Internet industries experience"
            ],
            "jobId": 12
        }
    ]




    data.forEach( async(d) => {
        let jobId = "JOBID000".concat(d.jobId.toString());
        await setDoc(doc(database, "jobs", jobId), d)
    })


    
}

const onInit = async() => {


    // await loadData();

    let _jobs_cache = localStorage.getItem('jobs')
    if(_jobs_cache !== null){
        state._jobs.data = JSON.parse(_jobs_cache).data;
    }

    await fetck();

     setJobViewState();
     fetchInitialJobsData();
    
}

window.onload = async() => {
     await onInit();
}

window.onresize = () => {
    setJobViewState();
}

const collectionNameForUsersDb = 'users';
const updatedSavedJobsByUser = async(email, jobId) => {

    const usersCollection = doc(database, collectionNameForUsersDb, email);
    await updateDoc(usersCollection, {
        savedJobsIds: arrayUnion(jobId)
    })
    createToast('bookmark', 'Save Job', new Date(), 'This job has been saved for you!', true)

    // let _userData = state._user._data;
    // console.log(state)
    // _userData.savedJobsIds.push(jobId)
    await setAndFetchUserDetails(email)
    setJobsState(() => {
    })  

}

const updatedAppliedJobsByUser = async(email, jobId) => {

    const usersCollection = doc(database, collectionNameForUsersDb, email);
    await updateDoc(usersCollection, {
        appliedJobsIds: arrayUnion(jobId)
    })
    createToast('rocket_launch', 'Apply Job', new Date(), 'You have now applied to this Job Posting!', true)

    // let _userData = state._user._data;
    // console.log(_userData)
    // _userData.appliedJobsIds.push(jobId)
    await setAndFetchUserDetails(email)
    setJobsState(() => {
    })  

}


const onCLickOfResumeUpload = (event) => {
    if(state._userAuthState.isAuth === false) {
        event.preventDefault()
        createToast('login', 'Resume Upload', new Date(), 'Please Login to upload Resume', true);
    }
}

$('resumeUploadLabel').addEventListener('click', onCLickOfResumeUpload)

const setJobViewStatusByKey = (key) => {

    if(state._userAuthState.isAuth === false && key !== 'initial'){
        createToast('login','VIew Data', new Date(), 'Please login to view '+ (key === 'save' ? 'saved' : key === 'apply' ? 'applied' : '')+ ' data',true);
    }else{

    let _jobs = state._jobs;
    _jobs.isViaSearch = false;

    _jobs.isViaInitial = ( key === 'initial');
    if(key === 'save')
        _jobs.isViaSaved = true;
    else
    _jobs.isViaSaved = false;
    if(key === 'apply')
        _jobs.isViaApplied = true
    else
        _jobs.isViaApplied = false
    
    // console.log('ststa after settig jobs state', state)
    setJobsState(() => {
        state._jobs = _jobs;
    })
}
}

$('viewAppliedJobBtn').addEventListener('click', () => {
    setJobViewStatusByKey('apply');
    coseSideNav();
})

$('viewSavedJobBtn').addEventListener('click', () => {
    setJobViewStatusByKey('save')
    coseSideNav();

})




const setAndFetchUserDetails = async(email) => {

    let fetchedUser = {};
        const usersCollection = doc(database, collectionNameForUsersDb, email);
        // const q = query(jobsCollection, where('isFeatured', '==', true))
        const querySnapshot = await getDoc(usersCollection);
        if(querySnapshot.exists()){
            fetchedUser = {id: querySnapshot.id, ...querySnapshot.data()}
            // console.log('user found in collection with ', email, '\n', querySnapshot )
        }else{
            // console.log('no user found in collection with ', email)
            // console.log('creating a new entry in users collection with ', email)
            await setDoc(doc(database, collectionNameForUsersDb, email), {
                name: state._user.name,
                appliedJobsIds: [],
                savedJobsIds: []
            })

        const usersCollection = doc(database, collectionNameForUsersDb, email);
        const querySnapshot = await getDoc(usersCollection);
        if(querySnapshot.exists()){
            // console.log('fetched the newly created user in the collection')
            fetchedUser = {id: querySnapshot.id, ...querySnapshot.data()}
        }else{
            // console.log('newly created user not fetched from the collection')
        }

        }
        // console.log(querySnapshot.data())
        // querySnapshot.forEach((doc) => {
            // if(doc)
            // fetchedUser =
            //     {id: doc.id, ...doc.data()}
        // })
       
        state._user._data = fetchedUser;
        checkIfResumeUploadedOnLoginLogout();

        // console.log('after setAndFetchUserDetails()',state)


}

export const coseSideNav = () => {
try {
    $('close-nav-bar').click();
} catch (error) {
    
}}

export const fileToBase64 = (filename, filepath) => {
    return new Promise(resolve => {
      var file = new File([filename], filepath);
      var reader = new FileReader();
      // Read file content on file loaded event
      reader.onload = function(event) {
        resolve(event.target.result);
      };
      
      // Convert data to base64 
      reader.readAsDataURL(file);
    });
  };

const uploadResume = async() => {

    let metadata = null;
    if(state._userAuthState.isAuth === false) {
        createToast('login', 'Resume Upload', new Date(), 'Please Login to upload Resume', true);
    }else{
        let base64File;
        const file = $('resumeUploadNav').files[0];
        // console.log('file', file)
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
            base64File = event.target.result;
            let resumeName = "resume_".concat(state._user.email);
            const storageRef = ref(storage, resumeName);
            uploadString(storageRef, base64File, 'data_url').then((snapshot) => {
                // console.log('uplaoded a pdf with string,', snapshot)
                // snapshot.ref.getDownloadURL().then(function(downloadURL){
                    // console.log('file available at ', downloadURL)
                //     metadata = downloadURL
                // })
               

                return getDownloadURL(snapshot.ref)

            }).then( downloadURL => {
                // console.log('file available at ', downloadURL)
                metadata = downloadURL;
                try {
                    $('view-resume-btn').href = metadata;

                } catch (error) {
                    
                }
                updt();
            })

            state._user._data.resumePdf = base64File;

        };

        // Convert data to base64
        fileReader.readAsDataURL(file);
    }

   const updt = async() => {

       if(metadata !== null) {
         const userRef = doc(database, collectionNameForUsersDb, state._user.email);
         
        //  console.log('user fdata',metadata)
         await updateDoc(userRef, {
             resume: true,
             resumeFileMetaData:  metadata
         })
         createToast('cloud_done', 'Resume Upload', new Date(), 'Your resume has been uploaded!',true)

         $('resume-uploaded-container').style.display = 'block';
         $('resume-upload-container').style.display = 'none';
     
         $('re-upload-resume-btn').addEventListener('click', () => {
             $('resume-uploaded-container').style.display = 'none';
             $('resume-upload-container').style.display = 'block';
         })
       }
   }

}

$('resumeUploadNav').onchange =() => {
    // console.log('on change handler')
    uploadResume()
}

// $('resumeUploadNav').onclick =() => {
    // console.log('on change handler')
//     uploadResume()
// }

const checkIfResumeUploadedOnLoginLogout = () =>{

    try {
        
        if(state._userAuthState.isAuth === true){
            if(state._user._data.resume === true){
                $('resume-uploaded-container').style.display = 'block';
                $('resume-upload-container').style.display = 'none';
        
                $('re-upload-resume-btn').addEventListener('click', () => {
                    $('resume-uploaded-container').style.display = 'none';
                    $('resume-upload-container').style.display = 'block';
                })
        
            }else{
                $('resume-uploaded-container').style.display = 'none';
                $('resume-upload-container').style.display = 'block';
            }
        }
        else{

            $('resume-uploaded-container').style.display = 'none';
            $('resume-upload-container').style.display = 'block';
        }

      
    } catch (error) {
        
    }

}

const userSignIn = async() => {
    // console.log("sign in clicked");
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user
        createToast('login', 'Login', new Date(), user.displayName + ' logged in successfully!', true );
        setAndFetchUserDetails(user.email)
        // checkIfResumeUploadedOnLoginLogout();
    }).catch((error)=> {
        createToast('login', 'Login', new Date(), error.message, true)
    })

  }

  const userSignOut = async() => {
    signOut(auth).then(() => {
        createToast('logout', 'Logout', new Date(), state._user.name + ' logged out successfully!', true );
        localStorage.clear();
        setJobViewStatusByKey('initial')
        coseSideNav();
    checkIfResumeUploadedOnLoginLogout();
    }).catch((error) => {
        createToast('logout', 'Logout', new Date(), error.message, true)
    }) 

  }

  onAuthStateChanged(auth, (user) => {
    // console.log('onAuthStateChanged called')
      let newAuthState = {};
    if(user){
        newAuthState.isAuth = true;
        newAuthState.showLoginBtn = false;
        newAuthState.showProfilePic = true;
        newAuthState.showLogoutBtn = true;

        let _user = {};
        _user.name = user.displayName;
        _user.photoURL = user.photoURL;
        _user.email = user.email;

        state._user = _user;

    } else{
        newAuthState.isAuth = false;
        newAuthState.showLoginBtn = true;
        newAuthState.showProfilePic = false;
        newAuthState.showLogoutBtn = false;  
    }

    // checkIfResumeUploadedOnLoginLogout();

    setAuthState(() => {
        state._userAuthState = newAuthState
    })

  })

  const renderAuthState = () => {

    if(state._userAuthState.isAuth){
        $('loginBtn').style.display = 'none';
        $('logoutBtn').style.display = 'inline';
        $('profilePhoto').style.display = 'inline';
        $('profilePhoto').src = state._user.photoURL;

    }else{
        $('loginBtn').style.display = 'inline';
        $('logoutBtn').style.display = 'none';
        $('profilePhoto').style.display = 'none';
        $('profilePhoto').src = '';


    }
    
  }
  const setAuthState = (callback) => {
    callback();
    renderAuthState();
  }

  const setJobsState = (callback) => {
    callback();
    renderJobsList();
  }

  const renderJobDesc = (jobId) => {

    // console.log('renderJobDesc() called for ', jobId)
    let jobsData = state._jobs.data;
    if(state._userAuthState.isAuth)
        jobsData = modifyJobsDataWithUserReference(jobsData)
    var _job = [];
    if(jobsData.length > 0) {
        _job = jobsData.filter((__job) => {
            return __job.id === jobId
        });

        const jd = $('jd');
        jd.innerHTML = '';

        if(_job.length === 1){
            let job = _job[0]
            let jdInnerHtml = `
            <div class="flex flex-column h-auto w-100 align-items-start justify-content-center desc-card">
            <div class="flex flex-row h-15 w-100 p-3 justify-content-between">
                <span class="job-name">
                    ${job.jobName}
                </span>
                <span role="button" data-ctx="collapse_jd" id="collapse_jd" class="material-symbols-outlined">
                    collapse_content
                </span>
            </div>

            <div class="flex flex-row gap-1 justify-content-between align-items-center ps-3 pe-3 pb-3 w-100 ">
                <span class="flex align-items-center gap-2">
                    <span class="material-symbols-outlined">
                        apartment
                        </span>
                    ${job.company}</span>
                <span class="material-symbols-outlined">
                    more_horiz
                </span>
                <span class="flex align-items-center gap-2">
                    <span class="material-symbols-outlined">
                        timeline
                        </span>
                        ${job.length}</span>
                <span class="material-symbols-outlined">
                    more_horiz
                </span>
                <span class="flex align-items-center gap-2">
                    <span class="material-symbols-outlined">
                        location_on
                        </span>
                        ${job.location}</span>
            </div>
            <div class="flex flex-row align-items-start h-15 w-100 ps-3 pe-3 gap-3">
                <span class="flex align-items-center gap-2">
                    <span class="material-symbols-outlined">
                        schedule
                        </span>
                    Posted</span>
                <span> ${getMomentByDate(job.postingDate.seconds * 1000)}</span>
            </div>

            <div class="flex flex-row w-50 h-auto p-3 gap-3">
                <button type="button" class="btn btn-secondary btn-sm flex align-items-center gap-2" data-bookmark="bookmark" data-job-id=${job.id} data-is-saved=${state._userAuthState.isAuth === true ? job.isSaved : false} >${job.isSaved ? 'Saved' : 'Save'} <span class="material-symbols-outlined">
                    ${job.isSaved ? 'bookmark_add' : 'bookmark'}
                    </span></button>
                <button type="button"  data-apply="apply" data-job-id=${job.id}  data-bs-toggle="modal" data-bs-target=${state._userAuthState.isAuth === true ? '#applyJobForm' : ''} data-is-applied=${state._userAuthState.isAuth === true ? job.isApplied : false} class="btn btn-secondary btn-sm flex align-items-center gap-2">${job.isApplied ? 'Applied' : 'Apply'} <span class="material-symbols-outlined">
                ${job.isApplied ? 'new_releases' : 'rocket_launch'}
                    </span></button>

            </div>
        </div>

        <div class="flex flex-column h-auto w-100 align-items-start justify-content-center desc-card p-3">
            <span>Job Description</span>
            <p class="pt-3  flex-wrap">
            ${job.jobDescription}
                </p>
        </div>


        <div class="flex flex-column h-auto w-100 align-items-start justify-content-center desc-card p-3">

            <div>
                <span>
                    Required Qualification
                </span>
                <ul class="ps-3 pt-2" style="list-style-type: disc !important;" id="rQual">
                </ul>
                <br>
                <span>
                    Preferred Qualification
                </span>
                <ul class="ps-3 pt-2" style="list-style-type: disc !important;" id="pQual">
                </ul>

            </div>

        </div>

        <div class="flex flex-column h-auto mw-100 align-items-start flex-wrap desc-card p-3">

            <div class="flex flex-row gap-2 mw-100 align-items-center justify-content-start">
                <span class="material-symbols-outlined">
                    track_changes
                    </span>
                <div class="flex skills-container" id="skills-container-desc">
                    <span class="badge rounded-pill"></span>
                </div>
            </div>

            </div>

            <div class="flex flex-column h-auto mw-100 align-items-start flex-wrap desc-card p-3">

            <span class="pb-3">
            About the Company
            </span>

            <p>
            ${job.aboutCompany}
            </p>
            </div>

            <div class="flex flex-column h-auto mw-100 align-items-start flex-wrap desc-card p-3">

            <div class="flex flex-row align-items-center justify-content-center gap-3">
            <span class="material-symbols-outlined">
                lightbulb
                </span>


                <span>
                    <span>Job ID</span>
                    ${job.id}
                </span>
            </div>
</div>


            `;

            jd.innerHTML += jdInnerHtml;

            let sikllsContainerDesc = $('skills-container-desc');
            job.skillTags.forEach((skill) => {
                sikllsContainerDesc.innerHTML += 
                `<span class="badge rounded-pill">${skill}</span>`
            })

            let pQual = $('pQual');
            let rQual = $('rQual')

            job.preferredQual.forEach((prefQual) => {
                pQual.innerHTML +=  `
                <li>${prefQual}</li>
                `;
            })

            job.requiredQual.forEach((reqQual) => {
                rQual.innerHTML +=  `
                <li>${reqQual}</li>
                `;
            })

            $('expand_jd')?.addEventListener('click', toggleJobView);
            $('collapse_jd')?.addEventListener('click', toggleJobView);
        }
    }

    addEventListnerToSaveAndApplyBtn();

  }

  const modifyJobsDataWithUserReference = (jobsData) => {

      let _decoratedDataList = [];

    //    console.log('modifyJobsDataWithUserReference called', state)
       const userSavedJobs = state._user._data?.savedJobsIds;
       const userAppliedJobs = state._user._data?.appliedJobsIds;
       if(state._userAuthState.isAuth) {
           jobsData.forEach((job) => {
                   job = { isSaved: userSavedJobs.includes(job.id), ...job}
                   job = { isApplied: userAppliedJobs.includes(job.id), ...job}

                   if(state._jobs.isViaSearch === true || state._jobs.isViaInitial === true){
                    if(!job.isApplied === true){
                        _decoratedDataList.push(job);
                    }
                 } else if(state._jobs.isViaSaved === true){
                    if(job.isSaved === true && !job.isApplied === true){
                        _decoratedDataList.push(job)
                    }
                } else if(state._jobs.isViaApplied === true){
                        if(job.isApplied === true){
                            _decoratedDataList.push(job)
                        }
                    }
                 }
           )}
           return _decoratedDataList
       }

  


  const bookmarkJob = (event) => {
    if(!state._userAuthState.isAuth){
        createToast('bookmark', 'Save Job', new Date(), 'Please Login to Save this Job', true)
    }else{
        updatedSavedJobsByUser(state._user.email, event.target.dataset.jobId)
        // createToast('bookmark', 'Save Job', new Date(), 'This job has been saved for you!', true)

    }
    // console.log(event.target.dataset.isSaved)
  } 

  const applyJobForm = (jobId) => {
    // event.preventDefault();
    // console.log('on submit',jobId)
        updatedAppliedJobsByUser(state._user.email,jobId)
        createToast('rocket_launch', 'Apply Job', new Date(), 'You have now applied to this Job Posting!', true)
        $('applyFormModalClose').click();
  }

  const autoFillForm = () =>{
    $('applyNowName').value = state._user.name
    $('applyNowEmail').value = state._user.email

    if(state._user._data.resume === true){
        $('resumeInForm').innerHTML = '';
        $('resumeInForm').innerHTML = `
        <span class="flex flex-row align-items-center gap-1">
        <span class="material-symbols-outlined">
                                        cloud_done
                                        </span>
        Resume uploaded from profile.!
        </span>
        `

    }
  }
  const applyJob = (event) => {
    if(!state._userAuthState.isAuth){
        createToast('rocket_launch', 'Apply Job', new Date(), 'Please Login to Apply for this Job', true)
    }else{
        $('applyNowModalBtn').dataset.dataJobId = event.target.dataset.jobId;
    //    setTimeout(()=> {
        // console.log('upload resume inside form',$('formFile'))

    //     const file = new File(state._user._data.pdf, 'resume.pdf')
    //     const dataTransfer = new DataTransfer();
    //     dataTransfer.items.add(file);
    //     $('formFile').files = dataTransfer.files;
    //     // $('formFile').value = state._user._data.pdf;
    //    }, 1000)
        // applyJobForm(event.target.dataset.jobId);

        autoFillForm();
    }
    // console.log(event.target.dataset.isApplied)
  }

//   $('applyNowModalBtn').addEventListener('click', event => {
//     event.preventDefault();
//     alert('its click event')
//   });

$('applyJobForm').addEventListener('submit', event => {
    event.preventDefault();
    // console.log(event)
    applyJobForm(event.submitter.attributes["data-data-job-id"].value);
  })

  const renderJobsList = () => {

    // console.log("render Jobs called", state)
    let jl = $('jl');
    jl.innerHTML = '';
    let jobsData = state._jobs.data;
    if(state._userAuthState.isAuth === true){
        jobsData = modifyJobsDataWithUserReference(jobsData)
    }
    // console.log('modified data : ', jobsData)
    if(jobsData.length > 0){
        jobsData.forEach((job, index) => {
            let jobInnerHtml = `
            <div class="job-card flex flex-column pt-2 pb-2">
                <div class="h-15 w-100 flex flex-row align-items-center justify-content-between p-2">
                    <span class="job-name">
                        ${job.jobName}
                    </span>
                    <div class=" flex align-items-center justify-content-between gap-4">
                        <span role="button" data-ctx="expand_jd" id="expand_jd" class="material-symbols-outlined" data-ctx="lg" data-job-id=${job.id}>
                            expand_content
                            </span>
                            <span role="button" class="material-symbols-outlined" data-bookmark="bookmark" data-job-id=${job.id} data-is-saved=${state._userAuthState.isAuth === true ? job.isSaved : false}>
                            ${job.isSaved ? 'bookmark_add' : 'bookmark'}
                                </span>
                        <button type="button" class="btn btn-secondary btn-sm" data-apply="apply" data-job-id=${job.id} data-bs-toggle="modal" data-bs-target=${state._userAuthState.isAuth === true ? '#applyJobForm' : ''}  data-is-applied=${state._userAuthState.isAuth === true ? job.isApplied : false}>${job.isApplied ? 'Applied' : 'Apply Now'}</button>
                    </div>

                </div>

                <div class="h-70 w-100 flex flex-column align-items-start justify-content-center">
                    <div class="flex flex-row gap-2 p-2 align-items-center justify-content-center">
                        <span class="material-symbols-outlined">
                            apartment
                            </span>
                        <span>
                        ${job.company}
                        </span>
                    </div>

                    <div class="flex flex-row gap-2 p-2 align-items-center justify-content-center">
                        <span class="material-symbols-outlined">
                            timeline
                            </span>
                        <span>
                        ${job.length}
                        </span>
                    </div>

                    <div class="flex flex-row gap-2 p-2 align-items-center justify-content-center">
                        <span class="material-symbols-outlined">
                            location_on
                            </span>
                        <span>
                        ${job.location}
                        </span>
                    </div>

                    <div class="flex flex-row gap-2 p-2 align-items-center justify-content-center">
                        <span class="material-symbols-outlined">
                            linked_services
                            </span>
                        <span>
                        ${job.expMin} - ${job.expMax} Years
                        </span>
                    </div>

                    <div class="flex flex-row gap-2 p-2 mw-100 align-items-center justify-content-start">
                        <span class="material-symbols-outlined">
                            track_changes
                            </span>
                        <div class="flex skills-container" id="skills-container-${index}">
                        </div>
                    </div>

                </div>

                <div class="h-15 w-100 flex flex-row align-items-center justify-content-between p-2">

                    <div class="flex flex-row gap-2 align-items-center justify-content-center">
                        <span class="material-symbols-outlined">
                            schedule
                            </span>
                        <span>
                            ${getMomentByDate(job.postingDate?.seconds * 1000)}
                        </span>
                    </div>
                </div>

        </div>
            `

            jl.innerHTML += jobInnerHtml;

            let skillsContainer = $('skills-container-'+index)

            job.skillTags.forEach((skill) => {
                skillsContainer.innerHTML += 
                `<span class="badge rounded-pill">${skill}</span>`
            })
            // console.log('index',index)

            if(index === 0){
                renderJobDesc(job.id)
            }

        })

        // $('expand_jd')?.addEventListener('click', toggleJobView);
        // $('collapse_jd')?.addEventListener('click', toggleJobView);

        // renderJobDesc(state._jobs.data[0].id)

        try {
            const btns = document.querySelectorAll('[data-bs-dismiss]');
            btns.forEach((btn) => {
                if(btn.attributes["data-bs-dismiss"].value === 'toast'){
                    setTimeout(() => {
                        btn.click()
                    }, 5000)
                }
            })
            
        } catch (error) {
            // console.log(error)
            
        }

        addEventListnerToSaveAndApplyBtn();

    }else{
        $('jd').innerHTML = '';
    }

  }

  const darkModeToggleFunc = (event) => {
    // console.log(event)
  }

  function load() {
    const button =  $('darkModeToggler');
  
    // MediaQueryList object
    const useDark = window.matchMedia("(prefers-color-scheme: dark)");

    // console.log('useDark', useDark);
  
    // Toggles the "dark-mode" class based on if the media query matches
    function toggleDarkMode(state) {
      // Older browser don't support the second parameter in the
      // classList.toggle method so you'd need to handle this manually
      // if you need to support older browsers.
      document.documentElement.classList.toggle("dark", state);
      if(state === false){
        document.documentElement.classList.add("light")
      }else{
        document.documentElement.classList.remove("light")

      }

        if(state === false){
            $('dark-mode-toggle-label').innerHTML = 'light_mode';
            $('dark-mode-toggle-label').style.color = 'black';
        }else{
            $('dark-mode-toggle-label').innerHTML = 'dark_mode';
            $('dark-mode-toggle-label').style.color = 'white'


        }
        // $('dark-mode-toggle-label').innerHTML = state === false ? 'light_mode' : 'dark_mode';

    }
  
    // Initial setting
    toggleDarkMode(useDark.matches);
  
    // Listen for changes in the OS settings
    useDark.addListener((evt) => toggleDarkMode(evt.matches));
  
    // Toggles the "dark-mode" class on click
    button.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");

      if(!document.documentElement.classList.contains("dark")){
        document.documentElement.classList.add("light")
      }else{
        document.documentElement.classList.remove("light")

      }

      if($('dark-mode-toggle-label').innerHTML === 'light_mode'){
        $('dark-mode-toggle-label').innerHTML = 'dark_mode';
        $('dark-mode-toggle-label').style.color = 'white'

      }else{
        $('dark-mode-toggle-label').innerHTML = 'light_mode';
        $('dark-mode-toggle-label').style.color = 'black';


      }
    //   $('dark-mode-toggle-label').innerHTML = $('dark-mode-toggle-label').innerHTML === 'light_mode' ? 'dark_mode' : 'light_mode';


    });
  }

  window.addEventListener("DOMContentLoaded", load);


//   $('darkModeToggler').addEventListener('click', darkModeToggleFunc);
  const addEventListnerToSaveAndApplyBtn =() => {
    try {
        const bookmarkBtns = document.querySelectorAll('[data-bookmark]');
        bookmarkBtns.forEach((btn) => {
            if(btn.attributes["data-bookmark"].value === 'bookmark'){
                btn.addEventListener('click', bookmarkJob)
            }
        })

        const applyBtns = document.querySelectorAll('[data-apply]');
        applyBtns.forEach((btn) => {
            if(btn.attributes["data-apply"].value === 'apply'){
                if(state._userAuthState.isAuth){
                    if(btn.attributes["data-is-applied"].value === 'true'){
                        btn.setAttribute("disabled",'')
                    }
                }
                btn.addEventListener('click', applyJob)
            }
        })

        const exoandJdBtns = document.querySelectorAll('[data-ctx]');
        exoandJdBtns.forEach((btn) => {
            if(btn.attributes["data-ctx"].value === 'expand_jd'){
                btn.addEventListener('click', toggleJobView)
            }
        })

        const collapseJdBtns = document.querySelectorAll('[data-ctx]');
        collapseJdBtns.forEach((btn) => {
            if(btn.attributes["data-ctx"].value === 'collapse_jd'){
                btn.addEventListener('click', toggleJobView)
            }
        })

    } catch (error) {
        createToast('warning', 'Error', new Date(), error.message, true )   
    }
  }

  const getMomentByDate = (aDateInS) => {
    return moment(aDateInS).fromNow();
  }

  $('loginBtn').addEventListener('click', userSignIn)
  $('logoutBtn').addEventListener('click', userSignOut)



  const createToast = (logo, header, duration, msg, autoHide) => {

    const toastLiveExample = $('liveToast')
    toastLiveExample.innerHTML = `
        <div class="toast-header flex gap-2">
            <span class="material-symbols-outlined">
            ${logo}
            </span>
            <strong class="me-auto">${header}</strong>
            <small>${getMomentByDate(duration.getTime())}</small>
            <button type="button"  class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">
            ${msg}
        </div>
    `
    toastLiveExample.dataset.bsAutohide =  autoHide !== null ? autoHide : true
    const toast = new bootstrap.Toast(toastLiveExample)
    toast.show();

  }