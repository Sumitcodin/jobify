
const $ = (id) => {
    return document.getElementById(id);
}

var state = {

    // _jobViewState : {
    //     isJobListInView : true,
    //     isJobDescInView : false,
    //     viewPortBp: 'lg'
    // }
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
    console.log(state)

    let isJdInView = state._jobViewState.isJobDescInView
    let isJlInView = state._jobViewState.isJobListInView

    // if(state._jobViewState.viewPortBp === 'sm'){
        $('jd').style.display = isJdInView ? 'block' : 'none';
        $('jl').style.display = isJlInView ? 'block' : 'none';
        
        if(isJdInView) $('jd').style.flexGrow = 1;
        if(isJlInView) $('jl').style.flexGrow = 1;


    // }

    // console.log( 'jd',$('jd').style)
    // console.log( 'jl',$('jl').style)
}

$('expand_jd').addEventListener('click', toggleJobView);
$('collapse_jd').addEventListener('click', toggleJobView);


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

const onInit = () => {
     setJobViewState();
    
}

window.onload = () => {
     onInit();
}

window.onresize = () => {
    setJobViewState();
}