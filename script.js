
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";

  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

  import { getDatabase, ref, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

  import { getFirestore, collection, query, where, doc, getDocs} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

  const firebaseConfig = {
    apiKey: "AIzaSyA_1GaZbo6ScKlmxYh8hyjJDLbT-CVOgkM",
    authDomain: "online-job-portal-1b29a.firebaseapp.com",
    databaseURL: "https://online-job-portal-1b29a-default-rtdb.asia-south1.firebasedatabase.app",
    projectId: "online-job-portal-1b29a",
    storageBucket: "online-job-portal-1b29a.appspot.com",
    messagingSenderId: "10071800677371",
    appId: "1:100718677371:web:255b170e7c1dcd09419908"
  };

    const app = initializeApp(firebaseConfig);
    const database = getFirestore();  
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
        email: ''
    },

    _jobs:{
        isViaSearch: false,
        isViaInitial: true,
        data: [],
        searchQp: ''
    },

    _query: ''
}

// Object.defineProperty(state, "_jobViewState", {
//     set: (changed) => {
//         console.log(state)
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



const searchInputChange = (event) => {
    state._query = event.target.value;    
}

const fetchSearchByQueryJobsData = async() => {
    

    // if((state._jobs.isViaSearch === true && state._jobs?.data?.length === 0) || state._jobs.isViaSearch == false){
        console.log('state data for search jobs is empty, fetching from db')
        let allJobsList = [];
        let searchedJobsList = [];

        let _allJobsList = localStorage.getItem('_search_jobs_raw_data');
        if(_allJobsList != null){
            console.log('fetched master search data from cache hit')
            allJobsList = JSON.parse(_allJobsList)
        }else{
            console.log('fetched master search data from db')
            const jobsCollection = collection(database, 'jobs');
            // const q = query(jobsCollection, where('isFeatured', '==', true))
            const querySnapshot = await getDocs(jobsCollection);
            querySnapshot.forEach((doc) => {
                if(doc)
                allJobsList.push(
                    {id: doc.id, ...doc.data()})
            })
            if(allJobsList.length > 0)
            localStorage.setItem("_search_jobs_raw_data", JSON.stringify(allJobsList))
        }

        console.log(allJobsList)
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
        _jobs.data = searchedJobsList;

        setJobsState(() => {
            state._jobs = _jobs;
        })
        localStorage.setItem('jobs', JSON.stringify(_jobs))

    // }
    // else if(state._jobs.isViaSearch === true && state._jobs?.data?.length > 0){
    //     console.log('state data for search jobs is retreived from cache hit')
    //     let _jobs = state._jobs;
    //     _jobs.isViaSearch = true;
    //     _jobs.isViaInitial = false
    //     setJobsState(() => {
    //         state._jobs = _jobs
    //     })
    // }

    console.log(state)

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


const fetchInitialJobsData = async() => {

    if(state._jobs?.data?.length === 0){

        console.log('state data for jobs is empty, fetching from db')

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

        setJobsState(()=> {
            state._jobs = _jobs
        })

        localStorage.setItem('jobs', JSON.stringify(_jobs))

    }else{
        console.log('state data for jos is retreived from cache hit')
        setJobsState(() => {})
    }

    $('searchInput').value = '';

}

$('homeBtnNav').addEventListener('click', fetchInitialJobsData);
$('homeBtnMenu').addEventListener('click', fetchInitialJobsData);


const onInit = () => {

    let _jobs_cache = localStorage.getItem('jobs')
    if(_jobs_cache !== null){
        state._jobs.data = JSON.parse(_jobs_cache).data;
    }

     setJobViewState();
     fetchInitialJobsData();
    
}

window.onload = () => {
     onInit();
}

window.onresize = () => {
    setJobViewState();
}

const userSignIn = async() => {
    // console.log("sign in clicked");
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user
        createToast('login', 'Login', new Date(), user.displayName + ' logged in successfully!', true );
    }).catch((error)=> {
        const errorMsg = error.message;
        alert(errorMsg)
    })
  }

  const userSignOut = async() => {
    signOut(auth).then(() => {
        createToast('logout', 'Logout', new Date(), state._user.name + ' logged out successfully!', true );
    }).catch((error) => {
        const errorMsg = error.message;
        alert(errorMsg)
    }) 
  }

  onAuthStateChanged(auth, (user) => {
    // console.log(user)
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

    let jobsData = state._jobs.data;
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
                <span>
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
                <button type="button" class="btn btn-secondary btn-sm flex align-items-center gap-2">Save <span class="material-symbols-outlined">
                    bookmark
                    </span></button>
                <button type="button" class="btn btn-secondary btn-sm flex align-items-center gap-2">Apply <span class="material-symbols-outlined">
                    rocket_launch
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
                    <span class="badge rounded-pill text-bg-dark">Skills</span>
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
                `<span class="badge rounded-pill text-bg-dark">${skill}</span>`
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

  }

  const renderJobsList = () => {

    console.log("render Jobs called")
    let jl = $('jl');
    jl.innerHTML = '';

    if(state._jobs.data.length > 0){
        state._jobs.data.forEach((job, index) => {
            let jobInnerHtml = `
            <div class="job-card flex flex-column pt-2 pb-2">
                <div class="h-15 w-100 flex flex-row align-items-center justify-content-between p-2">
                    <span>
                        ${job.jobName}
                    </span>
                    <div class=" flex align-items-center justify-content-between gap-4">
                        <span role="button" data-ctx="expand_jd" id="expand_jd" class="material-symbols-outlined" data-ctx="lg" data-job-id=${job.id}>
                            expand_content
                            </span>
                            <span role="button" class="material-symbols-outlined">
                                bookmark
                                </span>
                        <button type="button" class="btn btn-secondary btn-sm">Apply Now</button>
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
                        <div class="flex skills-container" id="skills-container">
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

            let skillsContainer = $('skills-container')

            job.skillTags.forEach((skill) => {
                skillsContainer.innerHTML += 
                `<span class="badge rounded-pill text-bg-dark">${skill}</span>`
            })


        })

        $('expand_jd')?.addEventListener('click', toggleJobView);
        $('collapse_jd')?.addEventListener('click', toggleJobView);

        renderJobDesc(state._jobs.data[0].id)

        try {
            const btns = document.querySelectorAll('[data-bs-dismiss]');
            btns.forEach((btn) => {
                if(btn.attributes["data-bs-dismiss"].value === 'toast'){
                    btn.click()
                }
            })
            
        } catch (error) {
            console.log(error)
            
        }
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