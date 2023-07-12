const placeList = document.getElementById('placeList')

let placeMakers = [] // 마커를 지울려면 저장되어야함


//맛집 불러오는 함수

function loadPlaces() {
    function createListItem(place) {
        const htmlText = `
                <li class="item">
            <div class="spec-container">
                <div class="name-container">
                    <span class="name">${place['name']}</span>
                    <span class="category">몰루</span>
                </div>
                <div class="op-container">
                    <span class="op-flag">나중에</span>
                    <span class="op-time">나중에</span>
                </div>
                <div class="address-container">
                    <span class="address">${place['addressSecondary']}</span>
                </div>
            </div>
            <div class="image-container">
                <img alt="" class="image" src="/place/thumbnail?index=${place['index']}">
                <span class="count">몰루</span>
            </div>
        </li>`;
        return new DOMParser().parseFromString(htmlText, 'text/html').querySelector('li')
        // const domParser = new DOMParser();
        // const dom = domParser.parseFromString(htmlText, 'text/html')
        // const listItem = dom.querySelector('li')
        // return listItem;
    }

    //최소,최대 위경도  남서쪽,북동쪽 좌표 불러오기
    const sw = mapElement.object.getBounds().getSouthWest(); //남서
    const ne = mapElement.object.getBounds().getNorthEast(); //북동
    //sw/ne 의 Ma -> latitude랑 비교
    //sw/ne의 La -> longtitude랑 비교
    console.log(sw)
    console.log(ne)

    const xhr = new XMLHttpRequest();
    xhr.open('GET', `/place/?minLat=${sw.Ma}&minLng=${sw.La}&maxLat=${ne.Ma}&maxLng=${ne.La}`);
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status >= 200 && xhr.status < 300) {


                placeList.querySelectorAll(':scope > .item').forEach(list => list.remove());
                //마커지우기
                for (const placeMaker of placeMakers) {
                    placeMaker.setMap(null); //카카오 참고

                }
                placeMakers = []; // 재할당 //그래서 let 으로 바꿈


                // 지도내 장소 찍기
                const places = JSON.parse(xhr.responseText)
                console.log(`현재 지도내 맛집 : ' ${places.length} 개`)

                //마커생성
                for (const place of places) {
                    const listItem = createListItem(place);

                    //상세정보 띄우기
                    listItem.onclick = function () {
                        detail.show(place)
                    }

                    placeList.append(listItem);

                    const position = new kakao.maps.LatLng(place['latitude'], place['longitude']);
                    console.log(position);
                    const marker = new kakao.maps.Marker({
                        'position': position
                    });
                    //마커 클릭하면 상세정보 띄우기
                    kakao.maps.event.addListener(marker, 'click', function () {
                        detail.show(place)
                    })


                    marker.setMap(mapElement.object);
                    placeMakers.push(marker); //변수에 저장하면 지울수도 있게되는것


                }
            } else {
                //TODO
            }
        }
    };
    xhr.send();
}

const detail = document.getElementById('detail');
detail.thumbnail = detail.querySelector('[rel="thumbnail"]')
detail.name = detail.querySelector('[rel="name"]');
detail.contact = detail.querySelector('[rel="contact"]')
detail.address = detail.querySelector('[rel="address"]');
detail.description = detail.querySelector('[rel="description"]')
detail.time = detail.querySelector('[rel="time"]')

const detailClose = document.getElementById('detailClose');

detail.show = function (place) {
    detail.thumbnail.setAttribute('src', `/place/thumbnail?index=${place['index']}`);
    detail.name.innerText = place['name'];
    detail.contact.innerText = `${place['contactFirst']}-${place['contactSecond']}-${place['contactThird']}`;
    detail.address.innerText = `${place['addressPrimary']} ${place['addressSecondary']}`;
    detail.description.innerText = place['description'];

    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysKo = ['일', '월', '화', '수', '목', '금', '토'];
    for (const day of daysEn) {
        const dayObject = JSON.parse(place['time'])[day];
        const tr = detail.time.querySelector(`[data-day="${day}"]`);

        console.log(place['time'][day]);
        console.log(day)
        console.log(place['time'][day])


        if (dayObject['operates'] === true) {
            tr.classList.remove('off');
            tr.innerHTML = `
                <th>${daysKo[daysEn.indexOf(day)]}</th>
                <td>${dayObject['open']}</td>
                <td>${dayObject['close']}</td>
                `;
        } else {
            tr.classList.add('off')
            tr.innerHTML = `
                <th>${daysKo[daysEn.indexOf(day)]}</th>
                <td colspan="2">휴업</td>
                `;
        }
    }

    detail.classList.add('visible')
}

detailClose.onclick = function () {
    detail.hide()
}