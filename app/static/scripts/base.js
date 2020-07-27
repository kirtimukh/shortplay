let connection = io.connect(base_url)


connection.on('connect_success', data=>{
  d = document.createElement('h5')
  d.innerText = data.user
  document.getElementById('user_id').append(d)
})


function requestPlay() {
  idfield = document.getElementById('player_id').value
  document.getElementById('player_id').value = ''
  connection.emit('send_request', {'request_to': idfield})
}


connection.on('receive_request', data => {
  confirmDialog(data.request_by, ans => {
    if (ans) {
      document.getElementById("arena").style.display = 'block'
      connection.emit('accept_request', {'accepted': true})
    } else {
      connection.emit('reject_request', {'reject_request': true})
    }
   });
})


connection.on('request_rejected', msg => {
  console.log(msg)
})


function confirmDialog(friend, handler){
  $(`<div class="modal fade" id="myModal" role="dialog"> 
      <div class="modal-dialog"> 
        <!-- Modal content--> 
        <div class="modal-content"> 
            <div class="modal-body" style="padding:10px;"> 
              <h4 class="text-center">tic-tac with ${friend} ?</h4> 
              <div class="text-center"> 
                <a class="btn btn-default btn-yes">yes</a> 
                <a class="btn btn-default btn-no">no</a> 
              </div> 
            </div> 
        </div> 
    </div> 
  </div>`).appendTo('body');

  $("#myModal").modal({
      backdrop: 'static',
      keyboard: false
  });

  $(".btn-yes").click(function () {
      handler(true);
      $("#myModal").modal("hide");
  });

  $(".btn-no").click(function () {
      handler(false);
      $("#myModal").modal("hide");
  });

  $("#myModal").on('hidden.bs.modal', function () {
      $("#myModal").remove();
  });
}
