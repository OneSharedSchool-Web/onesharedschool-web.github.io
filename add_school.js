var globalUser;
var coin;

$(document).ready(function () {


    $("#add_school_button_submit").click(function (e) {
        e.preventDefault();
        console.log("submit button clicked")

        var organizerID = firebase.auth().currentUser.uid;

        firebase.database().ref("Users/" + organizerID).once('value').then(function(snapshot) {
            var adminName = snapshot.val().name
            var email = snapshot.val().email
            var schoolName = $("#schoolName").val();
            var photoLink = $("#photoLink").val();
            var schoolDescription = $("#schoolDescription").val();
            var donationsUsedFor = $("#donationsUsedFor").val();
            var gofundmeLink = $("#gofundme").val();
            var otherVerificationInfo = $("#otherVerificationInfo").val();
            var latitude = $("#latitude").val();
            var longitude = $("#longitude").val();
            
            if(!otherVerificationInfo){
                otherVerificationInfo = "N/A"
            }
            if(gofundmeLink.indexOf("www.") == -1)gofundmeLink = "www." + gofundmeLink;
            if(gofundmeLink.indexOf("http://") == -1)gofundmeLink = "http://" + gofundmeLink;
            console.log(gofundmeLink);
    
            var selectedDriversLicense = document.getElementById('driversLicense').files[0];
            var selectedSchoolId = document.getElementById("schoolIDcard").files[0];
    
            selectedDriversLicense = new File([selectedDriversLicense], adminName + "_official", { type: selectedDriversLicense.type });
            selectedSchoolId = new File([selectedSchoolId], adminName + "_school", { type: selectedSchoolId.type });
    
            console.log(selectedDriversLicense.name)
            console.log(selectedSchoolId.name)
    
            if (!(adminName && email && schoolName && photoLink &&
                schoolDescription && donationsUsedFor && gofundmeLink && selectedDriversLicense
                && selectedSchoolId && latitude && longitude)) {
                alert("Please fill out all fields and try again")
                return
            }
    
            const ref = firebase.database().ref('SchoolCodes');
    
            ref.once('value', (data) => {
                var articleObj = data.val();
    
    
                var organizerID = firebase.auth().currentUser.uid;
    
                var schoolCode = Math.floor(1000000000 + Math.random() * 9000000000)
    
    
                if (articleObj != null) {
                    var keys = Object.keys(articleObj);
    
                    while (!checkDuplicates(schoolCode, keys)) {
                        schoolCode = Math.floor(1000000000 + Math.random() * 9000000000)
                    }
    
                }
    
                
                console.log("The school code is", schoolCode)
    
    
                //school post entry
                var proposedSchoolObject = {
                    adminName: adminName,
                    email: email,
                    otherVerificationInfo: otherVerificationInfo,
                    name: schoolName,
                    description: schoolDescription,
                    imageUri: photoLink,
                    items: donationsUsedFor.split(",").map(item => item.trim()),
                    organizerID: organizerID,
                    selectedDriversLicense: selectedDriversLicense.name,
                    selectedSchoolId: selectedSchoolId.name,
                    fundLink: gofundmeLink,
                    location: latitude + ", " + longitude,
                    schoolCode: schoolCode + ""
                    //TODO add all the other fields here
                }
    
                //push the new school to firebase
    
                try {
                    console.log("Selected file", selectedDriversLicense.name)
                    //var ext = selectedDriversLicense.name.split(".")[1]
                    var driverRef = firebase.storage().ref().child("AdminsToBeValidated/Drivers_" + organizerID);
                    driverRef.put(selectedDriversLicense).then(function (snapshot) {
                        console.log("Uploaded file successfully! :)")
                    })
    
                    //ext = selectedDriversLicense.name.split(".")[1]
                    var schoolIDref = firebase.storage().ref().child("AdminsToBeValidated/School_" + organizerID);
                    schoolIDref.put(selectedSchoolId).then(function (snapshot) {
                        console.log("Uploaded file successfully! :)");
                        firebase.database().ref('Users/' + globalUser.uid).update({
                            progress: 1
                        });
                        update(globalUser);
                    })
    
                    var updates = {};
                    proposedSchoolObject["schoolCode"] = schoolCode;
                    updates['/ProposedSchools/' + organizerID] = proposedSchoolObject;
                    firebase.database().ref().update(updates);
                } catch (e) {
                    console.log("Error updating firebase with new school records :(")
                    console.log(e)
                }
    
                // firebase.database().ref("Schools").once("value", (data) => {
                //     var sortedKeys = Object.keys(data.val()).sort();
    
                //     var newIndex = 1;
    
                //     if (sortedKeys.length != 0) {
                //         newIndex = parseInt(sortedKeys[sortedKeys.length - 1]) + 1;
                //     }
    
                //     console.log("New school will be inserted here", newIndex)
    
                    
                // }, null)
    
            }, errData);
    





        });
          
        // var firstName = $("#firstName").val();
        // var lastName = $("#lastName").val();
        // var schoolEmail = $("#schoolEmail").val();
        
    });



});

function checkDuplicates(key, arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == key) {
            return false
        }
    }
    return true
}

function gotData(data) {
}

function errData(data) {
    console.log("error finding the school code")
    console.log(data);
}

firebase.auth().onAuthStateChanged(function (user) {
    update(user);
});

function update(user) {
    if (user) {
        globalUser = user;
        firebase.database().ref('/Users/'+globalUser.uid).once('value').then(function (snapshot) {
            var usertype = (snapshot.val().usertype);
            // var keys2 = Object.keys(snapshot.val());
            if (usertype != "principal") {
                console.log(usertype);
                window.location.replace("portal.html");
            }
            else {
                console.log(snapshot.val().progress);
                if (snapshot.val().progress == 0) {

                }
                else if (snapshot.val().progress == 1) {
                    document.getElementById("hide").style.display = "none";
                    document.getElementById("comment").innerHTML = "Being Verified";
                }
                else if (snapshot.val().progress == 2) {
                    window.location.replace("dashboard.html");
                }

            }
        });
    }
    else {
        //window.location.replace("portal.html");
    }
}



function logout() {
    console.log("Trying to logout")
    firebase.auth().signOut().then(function () {
        // Sign-out successful.
        console.log("Logged out successfully")
        window.location.replace("portal.html");

    }).catch(function (error) {
        // An error happened.
    });
}