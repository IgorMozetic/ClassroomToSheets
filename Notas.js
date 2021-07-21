function importarNotaAlunos() {
    let courseList = getCourses();
    let activitiesList = courseList.map((course) => {
        let activities = getCoursesWork(course.id);
        activities.forEach((activity) => {
            getStudentSubmition(activity.id, course.id)
        })
    });

    console.log(filterUndefinedElement(activitiesList));
}



function getCourses() {
    let listaCursos = Classroom.Courses.list().courses;
    let teste = Classroom.Courses.list();
    return listaCursos;
}

function getCoursesWork(courseID) {
    let listaAtividades = Classroom.Courses.CourseWork.list(courseID).courseWork;
    return listaAtividades;
}



function filterUndefinedElement(arr) {
    let filteredArr;
    if (arr) {
        filteredArr = arr.filter((element) => {
            if (element) {
                return true;
            } else {
                return false;
            }
        });
        return filteredArr;
    }
}

function getStudentSubmition(activityID, courseID) {
    let nota = Classroom.Courses.CourseWork.StudentSubmissions.list(courseID, activityID);
    console.log(nota)
}