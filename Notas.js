function importarNotaAlunos() {
    let courseList = getCourses();
    let activitiesList = courseList.map((course) => {
        let activities = getCoursesWork(course.id);
        activities.forEach((activity) => {
            let atividadesEnviadas = getStudentSubmition(activity.id, course.id)
            console.log(atividadesEnviadas)
        })
    });

    // console.log(filterUndefinedElement(activitiesList));
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
    let atividadesEnviadas = Classroom.Courses.CourseWork.StudentSubmissions.list(courseID, activityID);
    return atividadesEnviadas.studentSubmissions.map((atividadeEnviada) => {
        let data = (!atividadeEnviada.updateTime ? atividadeEnviada.creationTime : atividadeEnviada.updateTime);
        let cursoId = atividadeEnviada.courseId;
        let userId = atividadeEnviada.userId;
        let nota = atividadeEnviada.assignedGrade;
        let notaAluno = { data, cursoId, userId, nota }
        return notaAluno;
    })
}
