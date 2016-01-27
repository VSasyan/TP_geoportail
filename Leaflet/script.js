var marker = false; ////Has the user plotted their location marker? 
var ville = false;
var data_response = false;
var lat, lng;
var map;

function initialize() {
	map = L.map('map-canvas').setView([46.77863469527167, 2.53896484375], 6);
	/*L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);*/
	//http://wxs.ign.fr/j5tcdln4ya4xggpdu4j0f0cn/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=GEOGRAPHICALGRIDSYSTEMS.PLANIGN&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX=8&TILEROW=106&TILECOL=151&FORMAT=image/jpeg

	var layerTypeIGN = 'GEOGRAPHICALGRIDSYSTEMS.MAPS';
	var clefIGN = 'urk9sxx23nr83rdxicj4d1ga';
	var urlIGN = "http://wxs.ign.fr/" + clefIGN + "/wmts?LAYER=" + layerTypeIGN + "&EXCEPTIONS=text/xml&FORMAT=image/jpeg&SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&STYLE=normal&TILEMATRIXSET=PM&TILEMATRIX={z}&TILECOL={x}&TILEROW={y}";
	this.layerIGN = L.tileLayer(urlIGN, {
		attribution : '&copy; <a href="http://www.ign.fr/">IGN-France</a>',
		opacity:0.80
	}).addTo(map);

	map.on('click', function(e) {
		if (marker === false) {
			marker = L.marker(e.latlng).addTo(map);
		} else{
			marker.setLatLng(e.latlng);
		}
		lat = e.latlng.lat;
		lng = e.latlng.lng;

		$('#result').removeClass('no');
		$('#ajax').html('<center><img src="images/ajax-loader.gif"/></center>');

		$.ajax({
			url: 'http://wxs.ign.fr/' + clefIGN + '/geoportail/ols?xls=' + encodeURIComponent(generateXML(lat, lng)),
			success: function (xmlDoc) {
				console.log(xmlDoc);
				var reponses = xmlDoc.getElementsByTagName("ReverseGeocodedLocation");
				console.log(reponses);
				var html = '';
				$.each(reponses, function(i, r) {
					html += locationHTML(r);
				});
				var autres = '<p><button id="showAll">Afficher/Masquer les autres adresses</button></p>';
				$('#ajax').html(html + (reponses.length > 1 ? autres : ''));
				$('#showAll').click(function() {$('#ajax').toggleClass('all');console.log(1)});
			}
		});

	});

}

function locationHTML(r) {
	// Adresse :
	var a = r.getElementsByTagName('Address')[0], adresse = '';
	if (a.attributes[0].nodeValue == 'StreetAddress') {
		adresse += a.getElementsByTagName('Building')[0].attributes[0].nodeValue;
		adresse += ', ';
		adresse += a.getElementsByTagName('Street')[0].childNodes[0].nodeValue;
	}
	
	// Ville :
	var ville = r.getElementsByTagName('Place')[0].childNodes[0].nodeValue;
	
	// Code Postal :
	var cp = r.getElementsByTagName('PostalCode')[0].childNodes[0].nodeValue;

	// Distance :
	var distance = r.getElementsByTagName('SearchCentreDistance')[0].attributes[0].nodeValue;

	// HTML :
	var html = '';
	html += '<div class="location">';
		html += '<p class="adresse">' + adresse + '</p>'
		html += '<p class="ville">' + cp + ', ' + ville + ' (' + distance + ' m)' + '</p>';
	html += '</div>';
	return html;
}

function generateXML(lat, lng) {
	return '<?xml version="1.0" encoding="UTF-8"?><XLS version="1.2" xmlns="http://www.opengis.net/xls" xmlns:gml="http://www.opengis.net/gml" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/xls http://schemas.opengis.net/ols/1.2/olsAll.xsd"><RequestHeader/><Request methodName="ReverseGeocodeRequest" maximumResponses="10" requestID="abc" version="1.2"><ReverseGeocodeRequest><ReverseGeocodePreference>StreetAddress</ReverseGeocodePreference><Position><gml:Point><gml:pos>'+lat+' '+lng+'</gml:pos></gml:Point></Position></ReverseGeocodeRequest></Request></XLS>';
}