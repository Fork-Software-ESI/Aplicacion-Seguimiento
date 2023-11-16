function buscarPaquete(Codigo) {
    var Codigo = new URLSearchParams(window.location.search).get('Codigo');

    var datos = {
        codigo: Codigo
    };

    jQuery.ajax({
        url: "http://localhost:8002/api/paquetes/codigo",
        type: "GET",
        data: datos,
        success: function (data) {
            var paquete = data.paquete;
            switch(paquete.ID_Estado){
                case 1:
                    paquete.ID_Estado = "En almacen";
                    break;
                case 2:
                    paquete.ID_Estado = "En lote";
                    break;
                case 3:
                    paquete.ID_Estado = "En transito";
                    break;
                case 4:
                    paquete.ID_Estado = "Entregado";
                    break;
            }

            var tablaResultadosBody = document.getElementById('tablaResultados');

            tablaResultadosBody.innerHTML = '';

            var fila = tablaResultadosBody.insertRow();

            var celdaID = fila.insertCell();
            celdaID.innerHTML = paquete.ID;

            var celdaCodigo = fila.insertCell();
            celdaCodigo.innerHTML = paquete.Codigo;

            var celdaDescripcion = fila.insertCell();
            celdaDescripcion.innerHTML = paquete.Descripcion;

            var celdaDestino = fila.insertCell();
            celdaDestino.innerHTML = paquete.Destino;

            var celdaEstado = fila.insertCell();
            celdaEstado.innerHTML = paquete.ID_Estado;

            obtenerCoordenadasAlmacen(paquete.Destino);
        },
        error: function (error) {
            alert('No se encontró el paquete');
        }
    });
}

function obtenerCoordenadasAlmacen(direccionAlmacen) {
    var Codigo = new URLSearchParams(window.location.search).get('Codigo');

    var datos = {
        codigo: Codigo
    };

    jQuery.ajax({
        url: "http://localhost:8002/api/paquetes/almacen",
        type: "GET",
        data: datos,
        success: function (data) {
            var almacen = data.almacen;
            var direccion = almacen.Direccion;

            var geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'address': direccion }, function (results, status) {
                if (status == 'OK') {
                    var coordenadasAlmacen = results[0].geometry.location;

                    inicializarMapa(coordenadasAlmacen, direccionAlmacen);
                } else {
                    alert('No se pudo obtener las coordenadas del almacén.');
                }
            });
        },
        error: function (error) {
            alert('No se pudieron obtener los datos del almacén.');
        }
    });
}

function inicializarMapa(coordenadasOrigen, destino) {
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({ 'address': destino }, function (results, status) {
        if (status == 'OK') {
            var coordenadasDestino = results[0].geometry.location;

            var mapaConfig = {
                center: coordenadasOrigen,
                zoom: 6,
            };
            var mapa = new google.maps.Map(document.getElementById('mapa'), mapaConfig);

            var marcadorOrigen = new google.maps.Marker({
                position: coordenadasOrigen,
                map: mapa,
                title: 'Origen (Almacén)'
            });

            var marcadorDestino = new google.maps.Marker({
                position: coordenadasDestino,
                map: mapa,
                title: 'Destino'
            });

            var directionsService = new google.maps.DirectionsService();
            var directionsRenderer = new google.maps.DirectionsRenderer();
            directionsRenderer.setMap(mapa);

            var request = {
                origin: coordenadasOrigen,
                destination: coordenadasDestino,
                travelMode: 'DRIVING'
            };

            directionsService.route(request, function (result, status) {
                if (status == 'OK') {
                    directionsRenderer.setDirections(result);
                } else {
                    alert('No se pudo obtener la ruta.');
                }
            });
        } else {
            alert('No se pudo obtener las coordenadas del destino.');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    buscarPaquete();
});
