function drawChart(){
    var chart=c3.generate({
        bindTo: '#visualisation',
        data: {
            columns:[
                ['data1',10,20,30,40,50],
                ['data2',20,30,15,20,30]
            ]
        },
        size: {
            height: 500,
            width: 500
        }
    });
}


