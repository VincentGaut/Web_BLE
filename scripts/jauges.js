var g = new JustGage({
	id: "gauge",
	value: pressionCapteur_1,
	min: 0,
	max: 10000,
	title: "Pression capteur 1"
	});
function update() {
	var capteur_1 = document.getElementById('pression_1').value
	g.refresh(capteur_1)
			
	}

var j = new JustGage({
	id: "gauge2",
	value: 67,
	min: 0,
	max: 100,
	title: "Pression capteur 2"
	});

function update() {
	var capteur_2 = document.getElementById('pression_2').value
	j.refresh(capteur_2)
		
	}

var btn = document.querySelector('.favorite styled');
btn.addEventListener('click', next_page);
