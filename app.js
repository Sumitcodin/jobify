
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";

  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

  import { getDatabase, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

  import { getFirestore, collection, query, where, doc, getDocs, setDoc, getDoc, addDoc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";
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


// await fetck();


    // if((state._jobs.isViaSearch === true && state._jobs?.data?.length === 0) || state._jobs.isViaSearch == false){
        // console.log('state data for search jobs is empty, fetching from db')
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

            // try to unsub from the snapshot listener
            // const unsub = onSnapshot(collection(database, 'jobs'), (doc) => {
            //     console.log(doc)
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
        _jobs.isViaSaved = false;
        _jobs.isViaApplied = false
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

const fetck = async() => {
let fetchedUser = {}
    const usersCollection = collection(database, collectionNameForUsersDb, state._user.email);
        const querySnapshot = await getDocs(usersCollection);
        querySnapshot.forEach((doc, index) => {
            if(doc.id === state._user.email){
                console.log(index,': fetched user data related to jobs with id: ', doc.id)
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



// await fetck();

    // if(state._jobs?.data?.length === 0){

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
    //     console.log('state data for jos is retreived from cache hit')
    //     setJobsState(() => {})
    // // }

    $('searchInput').value = '';

}

$('homeBtnNav').addEventListener('click', fetchInitialJobsData);
$('homeBtnMenu').addEventListener('click', fetchInitialJobsData);


const onInit = async() => {

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
    
    console.log('ststa after settig jobs state', state)
    setJobsState(() => {
        state._jobs = _jobs;
    })
}
}

$('viewAppliedJobBtn').addEventListener('click', () => {
    setJobViewStatusByKey('apply')
})

$('viewSavedJobBtn').addEventListener('click', () => {
    setJobViewStatusByKey('save')
})




const setAndFetchUserDetails = async(email) => {

    let fetchedUser = {};
        const usersCollection = doc(database, collectionNameForUsersDb, email);
        // const q = query(jobsCollection, where('isFeatured', '==', true))
        const querySnapshot = await getDoc(usersCollection);
        if(querySnapshot.exists()){
            fetchedUser = {id: querySnapshot.id, ...querySnapshot.data()}
            console.log('user found in collection with ', email, '\n', querySnapshot )
        }else{
            console.log('no user found in collection with ', email)
            console.log('creating a new entry in users collection with ', email)
            await setDoc(doc(database, collectionNameForUsersDb, email), {
                name: state._user.name,
                appliedJobsIds: [],
                savedJobsIds: []
            })

        const usersCollection = doc(database, collectionNameForUsersDb, email);
        const querySnapshot = await getDoc(usersCollection);
        if(querySnapshot.exists()){
            console.log('fetched the newly created user in the collection')
            fetchedUser = {id: querySnapshot.id, ...querySnapshot.data()}
        }else{
            console.log('newly created user not fetched from the collection')
        }

        }
        // console.log(querySnapshot.data())
        // querySnapshot.forEach((doc) => {
            // if(doc)
            // fetchedUser =
            //     {id: doc.id, ...doc.data()}
        // })
       
        state._user._data = fetchedUser;

        console.log('after setAndFetchUserDetails()',state)


}

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
        console.log('file', file)
        var fileReader = new FileReader();
        fileReader.onload = function(event) {
            base64File = event.target.result;
            let resumeName = "resume_".concat(state._user.email);
            const storageRef = ref(storage, resumeName);
            uploadString(storageRef, base64File, 'data_url').then((snapshot) => {
                console.log('uplaoded a pdf with string,', snapshot)
                // snapshot.ref.getDownloadURL().then(function(downloadURL){
                //     console.log('file available at ', downloadURL)
                //     metadata = downloadURL
                // })
               

                return getDownloadURL(snapshot.ref)

            }).then( downloadURL => {
                console.log('file available at ', downloadURL)
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
         
         console.log('user fdata',metadata)
         await updateDoc(userRef, {
             resume: true,
             resumeFileMetaData:  metadata
         })

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
    console.log('on change handler')
    uploadResume()
}

// $('resumeUploadNav').onclick =() => {
//     console.log('on change handler')
//     uploadResume()
// }


const userSignIn = async() => {
    // console.log("sign in clicked");
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user
        createToast('login', 'Login', new Date(), user.displayName + ' logged in successfully!', true );
        setAndFetchUserDetails(user.email)
    }).catch((error)=> {
        createToast('login', 'Login', new Date(), error.message, true)
    })

  }

  const userSignOut = async() => {
    signOut(auth).then(() => {
        createToast('logout', 'Logout', new Date(), state._user.name + ' logged out successfully!', true );
        localStorage.clear();
        setJobViewStatusByKey('initial')
    }).catch((error) => {
        createToast('logout', 'Logout', new Date(), error.message, true)
    }) 
  }

  onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged called')
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

    console.log('renderJobDesc() called for ', jobId)
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
                    <span class="badge rounded-pill">Skills</span>
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

       console.log('modifyJobsDataWithUserReference called', state)
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
    console.log('on submit',jobId)
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
    //     console.log('upload resume inside form',$('formFile'))

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
    console.log(event)
    applyJobForm(event.submitter.attributes["data-data-job-id"].value);
  })

  const renderJobsList = () => {

    console.log("render Jobs called", state)
    let jl = $('jl');
    jl.innerHTML = '';
    let jobsData = state._jobs.data;
    if(state._userAuthState.isAuth === true){
        jobsData = modifyJobsDataWithUserReference(jobsData)
    }
    console.log('modified data : ', jobsData)
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
            console.log('index',index)

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
            console.log(error)
            
        }

        addEventListnerToSaveAndApplyBtn();

    }else{
        $('jd').innerHTML = '';
    }

  }

  const darkModeToggleFunc = (event) => {
    console.log(event)
  }

  function load() {
    const button =  $('darkModeToggler');
  
    // MediaQueryList object
    const useDark = window.matchMedia("(prefers-color-scheme: dark)");

    console.log('useDark', useDark);
  
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