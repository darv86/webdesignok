// let obj = document.querySelector(".objects");
// function objectOutput(obj) {
// 	let res = "<ul>";

// 	for (i in obj) {
// 		res += "<li>" + i + " - " + obj[i] + "</li>";
// 	}

// 	res += "</ul>";

// 	document.write(res);
// }

// objectOutput(obj.style);

// obj.onclick = function() {
// 	obj.innerHTML = "lol";
// 	obj.style.color = "red";
// 	obj.className += " color-green";
// }

const mySelf = {
	firstName:  'Dima',
	lastName:  'Radushev',
	age:  34,
	langs: ['ru', 'en', 'es'],
}

const change = 'lastName';

console.log(mySelf[change]);