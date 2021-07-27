export function validateRegisterInput(username, email, profileImageLink, password, confirmPassword){
    const errors = {};
    const regEx = /^([0-9a-zA-Z]([-.\w]*[0-9a-zA-Z])*@([0-9a-zA-Z][-\w]*[0-9a-zA-Z]\.)+[a-zA-Z]{2,9})$/;

    if(username.trim() === ''){
        errors.username = 'Username cannot be empty';
    }
    else if(email.trim() === ''){
        errors.email = 'Email cannot be empty';
    }
    else if(!email.match(regEx)){
        errors.email = 'Email is not valid';
    }
    else if(profileImageLink.trim() === ''){
        errors.profileImageLink = 'You must provide a link to your profile photo'; 
    }
    else if(password === '' ){
        errors.password = 'Password must not be empty';
    }
    else if(password !== confirmPassword ){
        errors.confirmPassword = 'Passwords must match';
    }

    return{
        errors,
        valid: Object.keys(errors).length < 1 // means there is no errors
    }
}

export function validateLoginInput(username, password){
    const errors = {};

    if(username.trim() === ''){
        errors.username = 'Username cannot be empty';
    }
    else if(password === '' ){
        errors.password = 'Password must not be empty';
    }
    return{
        errors,
        valid: Object.keys(errors).length < 1
    }
}
