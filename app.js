  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";

  import { getDatabase, ref, get, set, child, update, remove } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-database.js";

  import { getFirestore, collection, doc, getDocs} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

  document.getElementById('logOutButton').style.display="none";



  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "apikey",
    authDomain: "authdomain",
    databaseURL: "databaseurl",
    projectId: "projecturl",
    storageBucket: "online-job-portal-1b29a.appspot.com",
    messagingSenderId: "msgid",
    appId: "appid"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);


// const db = getDatabase();
  const database = getFirestore();

  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  const logInButton = document.getElementById("logInButton");
  const logOutButton = document.getElementById("logOutButton");
  

  const userSignIn = async() => {
    console.log("sign in clicked");
    signInWithPopup(auth, provider)
    .then((result) => {
        const user = result.user
        console.log(user)
    }).catch((error)=> {
        const errorMsg = error.message;
        alert(errorMsg)
    })
  }

  const userSignOut = async() => {
    signOut(auth).then(() => {
        alert("Successfully logged Out !", 'secondary')
    }).catch((error) => {
        const errorMsg = error.message;
        alert(errorMsg)
    }) 
  }

  onAuthStateChanged(auth, (user) => {
    if(user){
        document.getElementById('logInButton').style.display="none";
        document.getElementById('logOutButton').style.display="inline";
        // document.getElementById('navToggler').style.display="inline";
        const profilePicTab = document.getElementById('profile-pic');
        profilePicTab.style.display="inline";
        profilePicTab.src=user.photoURL
        alert(user.displayName + ' signed In successfully !', 'success');
        // renderAllJobs();
        onInit();

    } else{
        document.getElementById('logInButton').style.display="inline";
        document.getElementById('logOutButton').style.display="none";
        document.getElementById('profile-pic').style.display="none";
        document.getElementById('navToggler').style.display="none";

        profilePicTab.style.display="none";
    }
  })


  logInButton.addEventListener('click', userSignIn);
  logOutButton.addEventListener('click', userSignOut);



  const alertPlaceholder = document.getElementById('liveAlertPlaceholder')

const alert = (message, type) => {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = [
    `<div class="alert alert-${type} alert-dismissible" role="alert">`,
    `   <div>${message}</div>`,
    '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
    '</div>'
  ].join('')

  alertPlaceholder.append(wrapper)

  setTimeout(() => {
    alertPlaceholder.style.display="none"
  }, 2500)
}


// function renderAllJobs(){

    // const dbRef = ref(db);

    // console.log('dbRef', dbRef)
    // get(child(dbRef, "jobs"))
    // .then((snapshot) => {
    //     console.log(snapshot)
    //     if(snapshot.exists()){
    //         snapshot.forEach(s => {
    //             console.log(s)
    //         })
    //     }else{
    //         console.log("snapshot doesn't exists")
    //     }
    // }).catch((error) => {
    //     console.log('fetch error', error)
    // })

// }

const renderAllJobs = async() => {
    const jobsCollection = collection(database, 'jobs');
    const jobsSnapshot = await getDocs(jobsCollection);
    const jobsList = jobsSnapshot.docs.map(doc => doc.data());
    console.log(jobsList)
    let jobListsDiv = document.getElementById('job-list');
    jobListsDiv.innerHTML = '';
    createJobCards(jobsList);

}
let searchJobButton 
let jobCard 

function onInit(){
    const experienceDropDown = document.getElementById('inputGroupSelect01');

    experienceDropDown.innerHTML = '';

    let option1 = new Option('Fresher', 0);
        experienceDropDown.add(option1, undefined)
    let i=1
    for(; i<=8; i++){
        let option = new Option(i, i);
        experienceDropDown.add(option, undefined)
    }
    // let next = i;
    let option = new Option('> '+i, (i));
    experienceDropDown.add(option, undefined)
    // console.log('experienceDropDown', experienceDropDown)

   searchJobButton = document.getElementById("button-addon2");
   searchJobButton.addEventListener('click', searchJob);
   
}
  function createJobCards(jobsList){

    const len = jobsList.length;
    let jobListsDiv = document.getElementById('job-list');
    jobListsDiv.innerHTML += `
    <div class="res-count">Showing ${len} job postings from search..</div>
    `;

    jobsList.forEach((eachJob, index) => {

        let job = `
        <div class="job" id="job-${index}">
              <div class="job-head">
                <div id="job-content">
                  <div id="info">
                    <div id="jobTitle">
                      ${eachJob.jobName}
                    </div>
                    <div id="companyName">
                      <span>
                      ${eachJob.company}
                      </span>
                    </div>
                  </div>
                  <div id="jobCardSubmitBtnWrapper">
                  <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    id="applyNowButton"
                  >
                    Apply Now
                  </button>
                </div>
                  <span class="material-symbols-outlined">
                    bookmark
                  </span>
                </div>
              </div>
              <div class="job-body">
                <div class="body-elements-wrap" id="period-wrap">
                  <span class="material-symbols-outlined">
                    approval
                  </span>
                  <div>${eachJob.length}</div>
                </div>
                <div class="body-elements-wrap" id="location-wrap">
                  <span class="material-symbols-outlined">
                    location_on
                  </span>
                  <div>${eachJob.location}</div>
                </div>
                <div class="body-elements-wrap" id="exp-wrap">
                  <span class="material-symbols-outlined">
                    work_history
                  </span>
                  <div>${eachJob.expMin} - ${eachJob.expMax} Years</div>
                </div>
                <div class="body-elements-wrap" id="ideas-wrap">
                  <span class="material-symbols-outlined">
                    lightbulb
                  </span>
                  <div id="ideas-list">
                  </div>
                </div>
              </div>
              <div class="job-footer">
                <div class="body-elements-wrap">
                  <span class="material-symbols-outlined">
                    schedule
                  </span>
                  <div id="timestamp">${new Date(eachJob.postingDate.seconds * 1000)}</div>
                </div>
              </div>
            </div>
        `; 
        jobListsDiv.innerHTML += job;
        let ideaList = document.getElementById('ideas-list')
    
            eachJob.skillTags.forEach((skill) => {
                ideaList.innerHTML +=
                `<span class="badge rounded-pill text-bg-light">${skill}</span>`
            })
    })
   

    currDataLength++;

    // return job;
  }


let currDataLength=0;

  const searchJob = async() =>{
   await  renderAllJobs();
  
    console.log('currDataLength')
    for(var i = 0; i < currDataLength; i++) {
            let jobWithId = document.getElementById('job-'+i)
            console.log('jobWithId',jobWithId)
            jobWithId.addEventListener('click', showMoreInfoPanel)

  }

}
  const showMoreInfoPanel = async() => {
    console.log('showMoreInfoPanel clicked');
      const infoPanel = document.getElementById('job-desc');
      infoPanel.style.display='flex';
      console.log(infoPanel.style.display)

      const jobList = document.getElementById('job-list');
      jobList.style.margin='auto';
      jobList.style.width='60%';


      const closeFsButton = document.getElementById('close-desc-fs');
      closeFsButton.addEventListener('click', hideMoreInfoPanel);
  }

  const hideMoreInfoPanel = async() => {
    console.log('hideMoreInfoPanel clicked');
      const infoPanel = document.getElementById('job-desc');
      infoPanel.style.display='none';
      console.log(infoPanel.style.display)

      const jobList = document.getElementById('job-list');
    //   jobList.style.margin='auto';
      jobList.style.width='auto';
      
  }



