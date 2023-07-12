const listElement = document.getElementById('list');
listElement.addressGu = listElement.querySelector('[rel="addressGu"]');
listElement.addressDong = listElement.querySelector('[rel="addressDong"]');

const mapElement = document.getElementById('map');
mapElement.geocoder = new kakao.maps.services.Geocoder();
mapElement.init = (params) => {
    mapElement.object = new kakao.maps.Map(mapElement, {
        center: new kakao.maps.LatLng(params.latitude, params.longitude),
        level: params.level
    });
    ['dragend', 'zoom_changed'].forEach(event => kakao.maps.event.addListener(mapElement.object, event, () => {
        const center = mapElement.object.getCenter();
        mapElement.savePosition({
            latitude: center.Ma,
            longitude: center.La,
            level: mapElement.object.getLevel()
        });
        mapElement.geocoder.coord2Address(center.La, center.Ma, (result, status) => {
            if (status === kakao.maps.services.Status.OK) {
                console.log(result);
                listElement.addressGu.innerText = result[0]['address']['region_2depth_name'];
                listElement.addressDong.innerText = result[0]['address']['region_3depth_name'];
            }
        });
    }));
};


//     kakao.maps.event.addListener(mapElement.object, 'dragend', () => {
//         console.log(mapElement.object.getCenter());
//         // 이동 할때마다 위도 경도 출력
//         mapElement.savePosition({
//             latitude: mapElement.object.getCenter().Ma,
//             longitude: mapElement.object.getCenter().La,
//             level: mapElement.object.getLevel()
//         });
//     });
//     kakao.maps.event.addListener(mapElement.object, 'zoom_changed', () => {
//         console.log(mapElement.object.getCenter());
//         // 이동 할때마다 위도 경도 출력
//         mapElement.sevePosition({
//             latitude: mapElement.object.getCenter().Ma,
//             longitude: mapElement.object.getCenter().La,
//             level: mapElement.object.getLevel()
//         });
//     });
//
// };

mapElement.savePosition = (params) => {
    localStorage.setItem('latitude', params.latitude);
    localStorage.setItem('longitude', params.longitude);
    localStorage.setItem('level', params.level);
};

const loadingElement = document.getElementById('loading');
loadingElement.show = () => loadingElement.classList.add('visible');
loadingElement.hide = () => loadingElement.classList.remove('visible');


const coverElement = document.getElementById('cover');
coverElement.show = (f) => {
    coverElement.classList.add('visible');
    coverElement.onclick = f;
    // visible 클릭했을때
}
coverElement.hide = () => {
    coverElement.classList.remove('visible');
    coverElement.onclick = undefined;
}

const loginForm = document.getElementById('loginForm');
loginForm.emailWarning = loginForm.querySelector('[rel="emailWarning"]');
loginForm.emailWarning.show = (text) => {
    loginForm.emailWarning.innerText = text;
    loginForm.emailWarning.classList.add('visible');
};

loginForm.emailWarning.hide = () => loginForm.emailWarning.classList.remove('visible');
loginForm.passwordWarning = loginForm.querySelector('[rel="passwordWarning"]');
loginForm.passwordWarning.show = (text) => {
    loginForm.passwordWarning.innerText = text;
    loginForm.passwordWarning.classList.add('visible');
};

loginForm.passwordWarning.hide = () => loginForm.passwordWarning.classList.remove('visible');

loginForm.show = () => {
    loginForm['email'].classList.remove('_invalid');
    loginForm.emailWarning.hide();
    // 이메일 입력 후 사라지는 설정
    loginForm['password'].classList.remove('_invalid');
    loginForm.passwordWarning.hide();
    // 비밀번호 입력 후 사라지는 설정
    loginForm.loginWarning.hide();

    loginForm['email'].value = '';
    loginForm['email'].focus();
    loginForm['password'].value = '';
    loginForm.classList.add('visible');
// 로그인 눌렀을시 실행 후 기입했던 내용들 지워짐
};


loginForm.loginWarning = loginForm.querySelector('[rel="loginWarning"]');
loginForm.loginWarning.show = (text) => {
    loginForm.loginWarning.innerText = text;
    loginForm.loginWarning.classList.add('visible');
};
loginForm.loginWarning.hide = () => loginForm.loginWarning.classList.remove('visible');

loginForm.hide = () => {
    loginForm.classList.remove('visible');
};

loginForm.hide = () => {
    loginForm.classList.remove('visible');
};

loginForm.onsubmit = e => {
    e.preventDefault();
    loginForm['email'].classList.remove('_invalid');
    loginForm.emailWarning.hide();
    loginForm['password'].classList.remove('_invalid');
    loginForm.passwordWarning.hide();
    loginForm.loginWarning.hide();
    if (loginForm['email'].value === '') {
        loginForm['email'].classList.add('_invalid');구
        loginForm['email'].focus();
        loginForm.emailWarning.show('이메일을 입력해 주세요');
        return false;
    }
    if (!new RegExp('^(?=.{10,50}$)([\\da-zA-Z\\-_\\.]{5,25})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$').test(loginForm['email'].value)) {
        loginForm['email'].classList.add('_invalid');
        loginForm['email'].focus();
        loginForm['email'].select();
        loginForm.emailWarning.show('올바른 이메일을 입력해 주세요.');
        return false;
    }
    if (loginForm['password'].value === '') {
        loginForm['password'].classList.add('_invalid');
        loginForm['password'].focus();
        loginForm.passwordWarning.show('비밀번호를 입력해 주세요.');
        return false;
    }
    if (!new RegExp('^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]};:\'",<.>/?]{8,50})$').test(loginForm['password'].value)) {
        loginForm['password'].classList.add('_invalid');
        loginForm['password'].focus();
        loginForm['password'].select();
        loginForm.passwordWarning.show('올바른 비밀번호를 입력해 주세요.');
        return false;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('email', loginForm['email'].value);
    formData.append('password', loginForm['password'].value);
    xhr.open('POST', '/user/login');
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
            return
        }
        if (xhr.status >= 200 && xhr.status < 300) {
            const responseObject = JSON.parse(xhr.responseText);
            switch (responseObject.result) {
                case 'success':
                    location.href+='';

                    break;
                case 'failure_suspended':
                    loginForm.loginWarning.show('해당 계정은 이용이 정지된 계정입니다. 관리자에게 문의해 주세요');
                    break;
                case 'failure':
                    loginForm.loginWarning.show('이메일 혹은 비밀번호가 올바르지 않습니다.');
                    loginForm['email'].focus();
                    loginForm['email'].select();
                    break;
                case 'failure_email_not_verified':
                    loginForm.loginWarning.show('이메일 인증이 완료되지 않은 계정입니다. 이메일 인증 후 다시 시도해 주세요.');
                    break;
                default:
                    loginForm.loginWarning.show('서버가 알 수 없는 응답을 반환했습니다. 관리자에게 문의해 주세요.');
            }
        } else {
            loginForm.loginWarning.show('서버와 통신하지 못하였습니다. 잠시 후 다시 시도해 주세요.')
        }
    };
    xhr.send(formData);
};

const registerForm = document.getElementById('registerForm');

registerForm.emailWarning = registerForm.querySelector('[rel="emailWarning"]');
registerForm.emailWarning.show = (text) => {
    registerForm.emailWarning.innerText = text;
    registerForm.emailWarning.classList.add('visible');
}
registerForm.emailWarning.hide = () => registerForm.emailWarning.classList.remove('visible');

registerForm.passwordWarning = registerForm.querySelector('[rel="passwordWarning"]');
registerForm.passwordWarning.show = (text) => {
    registerForm.passwordWarning.innerText = text;
    registerForm.passwordWarning.classList.add('visible');
}
registerForm.passwordWarning.hide = () => registerForm.passwordWarning.classList.remove('visible');

registerForm.nicknameWarning = registerForm.querySelector('[rel="nicknameWarning"]');
registerForm.nicknameWarning.show = (text) => {
    registerForm.nicknameWarning.innerText = text;
    registerForm.nicknameWarning.classList.add('visible');
}
registerForm.nicknameWarning.hide = () => registerForm.nicknameWarning.classList.remove('visible');

registerForm.termWarning = registerForm.querySelector('[rel="termWarning"]');
registerForm.termWarning.show = (text) => {
    registerForm.termWarning.innerText = text;
    registerForm.termWarning.classList.add('visible');
}
registerForm.termWarning.hide = () => registerForm.termWarning.classList.remove('visible');

registerForm.contactWarning = registerForm.querySelector('[rel="contactWarning"]');
registerForm.contactWarning.show = (text) => {
    registerForm.contactWarning.innerText = text;
    registerForm.contactWarning.classList.add('visible');
}
registerForm.contactWarning.hide = () => registerForm.contactWarning.classList.remove('visible');


registerForm.show = () => {
    registerForm.classList.remove('step-1', 'step-2', 'step-3');
    registerForm.classList.add('step-1', 'visible');
};
registerForm.hide = () => {
    registerForm.classList.remove('step-1', 'step-2', 'step-3', 'visible');
    registerForm['agreeServiceTerm'].checked = false;
    registerForm['agreePrivacyTerm'].checked = false;
    registerForm.termWarning.hide();

    registerForm['email'].value = '';
    registerForm.emailWarning.hide();
    // 값 지움 (초기화)

    registerForm['password'].value = '';
    registerForm['passwordCheck'].value = '';
    registerForm.passwordWarning.hide();

    registerForm['nickname'].value = '';
    registerForm.nicknameWarning.hide();

    registerForm['contact'].value = '';
    registerForm['contact'].removeAttribute('disabled');
    registerForm['contactSend'].removeAttribute('disabled');
    registerForm['contactCode'].value = '';
    registerForm['contactCode'].setAttribute('disabled', 'disabled');
    registerForm['contactVerify'].setAttribute('disabled', 'disabled');
    registerForm['contactSalt'].value = '';


};

registerForm.onsubmit = e => {
    e.preventDefault();
    if (registerForm.classList.contains('step-1')) {
        registerForm.termWarning.hide();
        if (!registerForm['agreeServiceTerm'].checked) {
            registerForm.termWarning.show('서비스 이용약관을 읽고 동의해 주세요.');
            return false;
        }
        if (!registerForm['agreePrivacyTerm'].checked) {
            registerForm.termWarning.show('개인정보 처리방침을 읽고 동의해 주세요.');
            return false;
        }
        registerForm.classList.remove('step-1');
        registerForm.classList.add('step-2');
        registerForm['email'].focus();
    }
    if (registerForm.classList.contains('step-2')) {
        if (registerForm['email'].value === '') {
            registerForm.emailWarning.show('이메일을 입력해 주세요.');
            registerForm['email'].focus();
            return ;
        }
        if (!new RegExp(`^(?=.{10,50}$)([\\da-zA-Z\\-_]{5,25})@([\\da-z][\\da-z\\-]*[\\da-z]\\.)?([\\da-z][\\da-z\\-]*[\\da-z])\\.([a-z]{2,15})(\\.[a-z]{2})?$`)
            .test(registerForm['email'].value)) {
            registerForm.emailWarning.show('올바른 이메일을 입력해주세요.');
            registerForm['email'].focus();
            registerForm['email'].select();
            return ;
        }
        if (registerForm['password'].value === '') {
            registerForm.passwordWarning.show('비밀번호를 입력해 주세요.');
            registerForm['password'].focus();
            return;
        }
        if (!new RegExp('^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]};:\'",<.>/?]{8,50})$').test(registerForm['password'].value)) {
            registerForm.passwordWarning.show('올바른 비밀번호를 입력해 주세요.');
            registerForm['password'].focus();
            registerForm['password'].select();
            return;
        }
        if (registerForm['passwordCheck'].value === '') {
            registerForm.passwordWarning.show('비밀번호를 다시 입력해 주세요.');
            registerForm['passwordCheck'].focus();
            return;
        }
        if (!new RegExp('^([\\da-zA-Z`~!@#$%^&*()\\-_=+\\[{\\]};:\'",<.>/?]{8,50})$').test(registerForm['passwordCheck'].value)) {
            registerForm.passwordWarning.show('올바른 비밀번호를 입력해 주세요.');
            registerForm['passwordCheck'].focus();
            registerForm['passwordCheck'].select();
            return;
        }
        if (registerForm['nickname'].value === '') {
            registerForm.nicknameWarning.show('별명을 입력해 주세요.');
            registerForm['nickname'].focus();
            return;
        }
        if (!new RegExp('^([가-힣]{2,10})$').test(registerForm['nickname'].value)) {
            registerForm.nicknameWarning.show('올바른 별명을 입력해 주세요.');
            registerForm['nickname'].focus();
            registerForm['nickname'].select();
            return;
        }
        if (registerForm['contactSalt'].value === '') {
            registerForm.contactWarning.show('연락처 인증을 완료해 주세요.');
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', registerForm['email'].value);
        formData.append('password', registerForm['password'].value);
        formData.append('nickname', registerForm['nickname'].value);
        formData.append('contact', registerForm['contact'].value);
        formData.append('code', registerForm['contactCode'].value);
        formData.append('salt', registerForm['contactSalt'].value);
        xhr.open('POST', '/user/register');
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                registerForm.classList.remove('working');
                // registerForm 가 DONE 일떄
                if (xhr.status >= 200 && xhr.status < 300) {
                    const responseObject = JSON.parse(xhr.responseText);
                    switch (responseObject.result) {
                        case 'failure':
                            registerForm.contactWarning.show('알수 없는 이유로 가입하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                            break;
                        case 'failure_duplicate_email':
                            registerForm.emailWarning.show('해당 이메일은 이미 사용중입니다.');
                            registerForm['email'].focus();
                            registerForm['email'].select();
                            break;
                        case 'failure_duplicate_nickname':
                            registerForm.nicknameWarning.show('해당 별명은 이미 사용 중입니다.');
                            registerForm['nickname'].focus();
                            registerForm['nickname'].select();
                            break;
                        case 'failure_duplicate_contact':
                            registerForm.contactWarning.show('해당 연락처는 이미 사용 중입니다.');
                            registerForm['contact'].focus();
                            registerForm['contact'].select();
                            break;
                        case 'success':
                            registerForm.classList.remove('step-2');
                            registerForm.classList.add('step-3');
                            break;
                        default:
                            registerForm.contactWarning.show('서버가 알 수 없는 응답을 반환하였습니다. 잠시후 다시 시도해 주세요.');
                    }
                } else {
                    registerForm.contactWarning.show('서버와 통신하지 못하였습니다. 잠시후 다시 시도해 주세요.');
                }
            }
        };
        xhr.send(formData);
        registerForm.classList.add('working');
    }
    if (registerForm.classList.contains('step-3')) {
        coverElement.hide();
        registerForm.hide();
    }
};
registerForm['contactSend'].addEventListener('click', () => {
    registerForm.contactWarning.hide();
    if (registerForm['contact'].value === '') {
        registerForm.contactWarning.show('연락처를 입력해 주세요');
        registerForm['contact'].focus();
        return;
    }
    if (!new RegExp('^(010)(\\d{8})$').test(registerForm['contact'].value)) {
        registerForm.contactWarning.show('올바른 연락처를 입력해 주세요.');
        registerForm['contact'].focus();
        registerForm['contact'].select();
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/user/contactCode?contact=${registerForm['contact'].value}`);
    // /user/contactCode?contact=01012345678
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
                const responseObjet = JSON.parse(xhr.responseText);
                switch (responseObjet.result) {
                    case 'failure_duplicate':
                        registerForm.contactWarning.show('해당 연락처는 이미 사용중입니다.');
                        registerForm['contact'].focus();
                        registerForm['contact'].select();
                        break;
                    case 'success':
                        registerForm['contact'].setAttribute('disabled', 'disabled');
                        registerForm['contactSend'].setAttribute('disabled', 'disabled');
                        registerForm['contactCode'].removeAttribute('disabled');
                        registerForm['contactVerify'].removeAttribute('disabled');
                        registerForm['contactCode'].focus();
                        registerForm['contactSalt'].value = responseObjet.salt;
                        registerForm.contactWarning.show('입력하신 연락처로 인증번호를 전송하였습니다. 5분 이내로 입력해 주세요.');
                        break;
                    default:
                        registerForm.contactWarning.show('서버가 알 수 없는 응답을 반환했습니다. 잠시후 다시 시도해 주세요.');
                }

            } else {
                registerForm.contactWarning.show('서버와 통신하지 못하였습니다. 잠시후 다시 시도해 주세요.');
            }
        }
    };
    xhr.send();
    // 전달 인자
});

// 인증번호 확인 구현
registerForm['contactVerify'].addEventListener('click', () => {
    registerForm.contactWarning.hide();
    if (registerForm['contactCode'].value === '') {
        registerForm.contactWarning.show('인증번호를 입력해 주세요.');
        registerForm['contactCode'].focus();
        return;
    }
    if (!new RegExp('^(\\d{6})$').test(registerForm['contactCode'].value)) {
        registerForm.contactWarning.show('올바른 인증번호를 입력해 주세요.');
        registerForm['contactCode'].focus();
        registerForm['contactCode'].select();
        return;
    }
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('contact', registerForm['contact'].value);
    formData.append('salt', registerForm['contactSalt'].value);
    formData.append('code', registerForm['contactCode'].value);
    xhr.open('PATCH', '/user/contactCode');
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
                const responseObject = JSON.parse(xhr.responseText);
                switch (responseObject.result) {
                    case 'failure_expired':
                        registerForm.contactWarning.show('해당 인증번호는 만료되었습니다. 처음부터 다시 진행해 주세요.');
                        break;
                    case 'success':
                        registerForm['contactCode'].setAttribute('disabled', 'disabled');
                        registerForm['contactVerify'].setAttribute('disabled', 'disabled');
                        registerForm.contactWarning.show('인증이 완료되었습니다.');
                        break;
                    default:
                        registerForm['contactCode'].focus();
                        registerForm['contactCode'].select();
                        registerForm.contactWarning.show('인증번호가 올바르지않습니다. 다시 확인해 주세요.');
                }
            } else {
                registerForm.contactWarning.show('서버와 통신하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        }
    };
    xhr.send(formData);
});

registerForm['email'].addEventListener('focusout', () => {
    // alert('이메일 포커스 아웃');
    registerForm.emailWarning.hide();
    if (registerForm['email'].value === '') {
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/user/emailCount?email=${registerForm['email'].value}`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
                const responseObjet = JSON.parse(xhr.responseText);
                switch (responseObjet.result) {
                    case 'duplicate':
                        registerForm.emailWarning.show('해당 이메일은 이미 사용 중입니다.');
                        break;
                    case 'okay':
                        registerForm.emailWarning.show('해당 이메일은 사용할 수 있습니다.');
                        break;
                    default:
                        registerForm.emailWarning.show('서버가 알 수 없는 응답을 반환했습니다. 잠시후 다시 시도해 주세요.');
                }
            } else {
                registerForm.emailWarning.show('서버와 통신하지 못하였습니다. 잠시 후 다시 시도해 주세요.');

            }
        }
    };
    xhr.send();
});


['password', 'passwordCheck'].forEach(name => {
    registerForm[name].addEventListener('focusout', () => {
        registerForm.passwordWarning.hide();
        if (registerForm['password'].value === '') {
            registerForm.passwordWarning.show('비밀번호를 입력해 주세요');
            return;
        }
        if (registerForm['passwordCheck'].value === '') {
            registerForm.passwordWarning.show('비밀번호를 다시 한번 더 입력해 주세요');
            return;
        }
        if (registerForm['password'].value !== registerForm['passwordCheck'].value) {
            registerForm.passwordWarning.show('비밀번호가 서로 일치하지 않습니다.');
            return;
        }
    });
});
registerForm['nickname'].addEventListener('focusout', () => {
    registerForm.nicknameWarning.hide();
    if (registerForm['nickname'].value === '') {
        registerForm.nicknameWarning.show('별명을 입력해 주세요.');
        return;
    }
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/user/nicknameCount?nickname=${registerForm['nickname'].value}`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {
                const responseObjet = JSON.parse(xhr.responseText);
                switch (responseObjet.result) {
                    case 'duplicate':
                        registerForm.nicknameWarning.show('해당 별명은 이미 사용 중입니다.');
                        break;
                    case 'okay':
                        registerForm.nicknameWarning.show('해당 별명은 사용 할수 있습니다.');
                        break;
                    default:
                        registerForm.nicknameWarning.show('서버가 알 수 없는 응답을 반환했습니다. 잠시후 다시 시도해 주세요.');
                }
            } else {
                registerForm.nicknameWarning.show('서버와 통신하지 못하였습니다. 잠시 후 다시 시도해 주세요.');

            }
        }
    };
    xhr.send();
});


// 로그인 경고문
const methods = {
    hideLogin: (x, e) => {
        coverElement.hide();
        loginForm.hide();
    },
    hideRegister: (x, e) => {
        coverElement.hide();
        registerForm.hide();
    },
    // 취소 버튼 누르면 닫힘
    showLogin: (x, e) => {
        coverElement.show(() => {
            coverElement.hide();
            loginForm.hide();
        });
        loginForm.show();
        // alert('로그인해야함!');
    },
    showRegister: (x, e) => {
        e.preventDefault();
        coverElement.show(() => {
            coverElement.hide();
            registerForm.hide();
        });
        loginForm.hide();
        registerForm.show();
    },
    showRecover: (x, e) => {
        e.preventDefault();
        loginForm.hide();
        coverElement.show(() => {
            coverElement.hide();
            recoverForm.hide();
        });
        recoverForm.show();
        recoverForm['eContact'].focus();
    },
    logout: (x, e) => {
        alert('로그아웃 해야함');
    }
};
document.body.querySelectorAll('[data-method]').forEach(x => {
    if (typeof methods[x.dataset.method] === 'function') {
        x.addEventListener('click', e => {
            methods[x.dataset.method](x, e);
        });
    }
});
// body 자식 data-method 선택  forEach x로 돌리고 x.dataset.method (dataset 어쩌고?) showLogin 으로 가고있다


window.addEventListener('load', () => {
    loadingElement.hide();
});
document.body.querySelectorAll('[data-action]').forEach(element => {
    element.addEventListener('click', e => {
        const action = element.dataset.action;
        switch (action) {
            case 'logout':
                location.href = '/user/logout';
                break;
            case 'showLogin':
                coverElement.show(() => {
                    coverElement.hide();
                    loginForm.hide();
                });
                loginForm.show();
                break;
            case 'showRecover':
                e.preventDefault();
                loginForm.hide();
                coverElement.show(() => {
                    coverElement.hide();
                    recoverForm.hide();
                });
                recoverForm.show();
                recoverForm['eContact'].focus();
                break;
            case 'showRegister':
                e.preventDefault();
                coverElement.show(() => {
                    coverElement.hide();
                    registerForm.hide();
                });
                loginForm.hide();
                registerForm.show();
                break;
        }
    });
});

// 이동 경로 (확대, 축소)

if (localStorage.getItem('latitude') &&
    localStorage.getItem('longitude') &&
    localStorage.getItem('level')) {
    mapElement.init({
        latitude: parseFloat(localStorage.getItem('latitude')),
        longitude: parseFloat(localStorage.getItem('longitude')),
        level: parseInt(localStorage.getItem('level'))
    });
} else {
    navigator.geolocation.getCurrentPosition(e => {
        mapElement.init({
            latitude: e.coords.latitude,
            longitude: e.coords.longitude,
            level: 3
            // level 확대 축소
        });
    }, () => {
        mapElement.init({
            latitude: 35.8715411,
            longitude: 128.601505,
            level: 3
        });
    });
}


// let mapObject;
//
// const initMapObject = () => {
//     navigator.geolocation.getCurrentPosition(e => {
//         mapObject = new kakao.maps.Map(mapElement, {
//             center: new kakao.maps.LatLng(e.coords.latitude, e.coords.longitude),
//             level: 3
//             // 좋아요 성공했을시
//         });
//     }, () => {
//         mapObject = new kakao.maps.Map(mapElement, {
//             center: new kakao.maps.LatLng(33.450701, 126.570667),
//             level: 3
//             // 싫어요
//         });
//         // 좋아요 , 싫어요 실행하는 페이지 요청 문
//     });
// };
// initMapObject();


