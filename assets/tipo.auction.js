window.TPAApp = {}
var sel = document.getElementsByClassName("tpa_content");

function initCountDown(datetime){
	datetime = new Date(datetime+' UTC').toLocaleString()
	var date     = new Date(),
        end_date = new Date(datetime);
	var countdown = (end_date-date)/1000

  	var clock,daily = 'DailyCounter';
	if (countdown<86400) daily = 'HourlyCounter';
    clock =  new FlipClock($('.tpa_content .clock'),{
        clockFace: daily,
        autoStart: false,
        callbacks: {
            stop: function() {
                $('.tpa_content .clock').hide()
            }
        }
    });
    clock.setTime(countdown);
    clock.setCountdown(true);
    clock.start();
}
function initSingleCountDown(datetime,sel,isCollectionPage=false){
	if($(sel).width() >= 160 && $(sel).width() < 320)
		$(sel).closest('[class*="tpa"]').addClass('tpa-x160')
	let date     = new Date(),
        end_date = new Date(toLocalTime(datetime).replace(/-/g, "/"));
	let countdown = (end_date-date)/1000;

  	let clock,daily = 'DailyCounter';
	let option = {
        clockFace: daily,
        autoStart: false,
        callbacks: {
            stop: function() {
                $(sel).closest('[class*="tpa"]').hide()
            }
        }
    }
	if (countdown<86400) daily = 'HourlyCounter';

	try {
	  clock = $(sel).FlipClock(countdown,option);
	}
	catch(err) {
	  clock = new FlipClock($(sel),countdown,option);
	}
    clock.setCountdown(true);
    clock.start();

	// Fix for > 100 days
	const listFlips = $(sel).find('.flip')
    var counter = 0 ;
    for( var i = listFlips.length-1 ; i >=0 ; i-- ){
        if(counter < 6 ){
          	if(counter%2 == 0)
              listFlips.eq(i).addClass('even')
            else
              listFlips.eq(i).addClass('odd')
        }

    	if(counter < 2 )
          listFlips.eq(i).addClass('seconds')
        else if (counter < 4)
          listFlips.eq(i).addClass('minutes')
        else if (counter < 6)
          listFlips.eq(i).addClass('hours')
        else{
          listFlips.eq(i).addClass('days')
          if (counter == 6)
            listFlips.eq(i).addClass('last')
          else if (counter == listFlips.length-1)
            listFlips.eq(i).addClass('first')
          else
            listFlips.eq(i).addClass('between')
        }
        counter++
    }
}
var engine = new Liquid()
function initEngine() {
    // Register Filter
	engine.registerFilter('format_money', (v, format) => {
        return  TPAConfigs.formatMoney(v,format)
      })
    engine.registerFilter('to_string', (v) => {
        return JSON.stringify(v)
      })
    engine.registerFilter('to_json', (v) => {
        return JSON.parse(v)
      })
    engine.registerFilter('isset', (v) => {
      return (typeof(v) !== 'undefined') ? true : false
      })
	engine.registerFilter('is_later', (v) => {
      return (moment(v) > moment()) ? true : false
	})
    engine.registerFilter('replace_id', (v,id) => {
      return (v.replace('{id}',id))
  })
  engine.registerFilter('include', (arr,field) => {
      return arr.includes(field)
  })
}

async function TPAmain(){
	// Check install
	var installed = false;
	$("script").each(function() {
	   if ($(this).text().indexOf("tipo.auction.init.js?") != -1 && $(this).text().indexOf("asyncLoad") != -1 && $(this).text().indexOf("initSchema") == -1) {
	       installed = true;
	   }
	   if(typeof TPAInstalled!== 'undefined') {
	      installed = true;
	   }
	});
	if(!installed) return false // If not install, end here
	initEngine()
  	var auction_container = $('.tpa_content')
  	var product_id = TPAConfigs.product && TPAConfigs.product.id || null;
    TPAConfigs.state['product_id'] = product_id
  	var activeAuction = await fetchBidHistory()
    // Hide add to cart , price
    var statusAuction = TPAApp.getAuctionStatus(TPAConfigs.product)
    if(TPAConfigs.selector){
      var hideAtc=false,hidePrice=false
      if(statusAuction === 0){ // Stop
        if(TPAConfigs.settings.hide_atc_when_stopped === '1'){
        	hideAtc = true
        }
        if(TPAConfigs.settings.hide_price_when_stopped === '1'){
        	hidePrice = true
        }
      }
      if(statusAuction === 1){ // Running
      	if(TPAConfigs.settings.hide_atc_when_running === '1'){
        	hideAtc = true
        }
        if(TPAConfigs.settings.hide_price_when_running === '1'){
        	hidePrice = true
        }
      }
      if(statusAuction === 2){ // Pending
      	if(TPAConfigs.settings.hide_atc_when_pending === '1'){
        	hideAtc = true
        }
        if(TPAConfigs.settings.hide_price_when_pending === '1'){
        	hidePrice = true
        }
      }
      if(hideAtc){
      	$(TPAConfigs.selector.add_to_cart).hide()
      }
      if(hidePrice){
      	$(TPAConfigs.selector.price).eq(0).hide()
        auction_container.find(TPAConfigs.selector.price).attr('style','')
      }
    }
    //
    var form = typeof tpaFormSelector !== 'undefined' ? tpaFormSelector : $('.tpa_product_form')
    if(!form.length){
      form = $('form[method="post"][action*="/cart/add"]:visible:first')
    }
    if(activeAuction && form.length){
        // Settings
        if(TPAConfigs.settings.bid_history_column){
            if(!TPAConfigs.settings.bid_history_column.includes("email")){
            	auction_container.find('.email_column').hide()
            }
          	if(!TPAConfigs.settings.bid_history_column.includes("username")){
            	auction_container.find('.username_column').hide()
            }
          	if(!TPAConfigs.settings.bid_history_column.includes("bid_amount")){
            	auction_container.find('.bid_amount_column').hide()
            }
          	if(!TPAConfigs.settings.bid_history_column.includes("bid_time")){
            	auction_container.find('.bid_time_column').hide()
            }
        }
		$('.tpa_content').insertAfter(form)
      	$('.tpa_content').show();
      	$(".tpa_content").attr('data-auction-id', activeAuction.id);
      	$(".tpa_content").attr('data-product-id', activeAuction.product_id);
      	initSingleCountDown(activeAuction.end_time,$('.tpa_content .clock'),false);

      	// Trans

      	auction_container.find('.end_in').text(TPAConfigs.settings.trans_end_in);

        auction_container.find('.bids .label').text(TPAConfigs.settings.trans_bids);
      	auction_container.find('.start_price .label').text(TPAConfigs.settings.trans_start_price);

      	auction_container.find('.reserve_price .label').text(TPAConfigs.settings.trans_reserve_price);
      	auction_container.find('.buyout_price .label').text(TPAConfigs.settings.trans_buyout_price);

      	auction_container.find('.current_price .label').text(TPAConfigs.settings.trans_current_price);
        auction_container.find('.bidder .label').text(TPAConfigs.settings.trans_bidder);
      	auction_container.find('.start_time .label').text(TPAConfigs.settings.trans_start_time);
      	auction_container.find('.end_time .label').text(TPAConfigs.settings.trans_end_time);


      	auction_container.find('#bid').text(TPAConfigs.settings.trans_bid_now);
      	auction_container.find('.automatic_bid_label').text(TPAConfigs.settings.trans_automatic_bid);
      	auction_container.find('.automatic_bid_wrapper [tooltip]').attr('tooltip',TPAConfigs.settings.trans_automatic_bid_tooltip);
        auction_container.find('.bid_history_label').text(TPAConfigs.settings.trans_bid_history);

      	auction_container.find('.username_label').text(TPAConfigs.settings.trans_username);
      	auction_container.find('.email_label').text(TPAConfigs.settings.trans_email);
      	auction_container.find('.bid_amount_label').text(TPAConfigs.settings.trans_bid_amount);
        auction_container.find('.bid_time_label').text(TPAConfigs.settings.trans_bid_time);

      	auction_container.find('.username_column').attr('data-label',TPAConfigs.settings.trans_username);
        auction_container.find('.email_column').attr('data-label',TPAConfigs.settings.trans_email);
        auction_container.find('.bid_amount_column').attr('data-label',TPAConfigs.settings.trans_bid_amount);
      	auction_container.find('.bid_time_column').attr('data-label',TPAConfigs.settings.trans_bid_time);
      	

      	auction_container.find('.flip-clock-divider.days .flip-clock-label').text(TPAConfigs.settings.trans_clock_days);
      	auction_container.find('.flip-clock-divider.hours .flip-clock-label').text(TPAConfigs.settings.trans_clock_hours);
        auction_container.find('.flip-clock-divider.minutes .flip-clock-label').text(TPAConfigs.settings.trans_clock_minutes);
        auction_container.find('.flip-clock-divider.seconds .flip-clock-label').text(TPAConfigs.settings.trans_clock_seconds);

        auction_container.find('.your_bid .prefix').text(TPAConfigs.money_character);
        
        
      	$("#stopAuctionModal .modal__header .modal__title").html(TPAConfigs.settings.trans_stop_auction_heading)
        $("#stopAuctionModal .modal__footer .modal__btn-secondary").html(TPAConfigs.settings.trans_stop_auction_close_button)
        $("#stopAuctionModal .modal__footer .modal__btn-primary").html(TPAConfigs.settings.trans_stop_auction_checkout_button)
		//

      	// Bind val
      	auction_container.find('.start_price .value').text(TPAConfigs.settings.trans_bids);
      	TPAConfigs.formatMoney(TPAConfigs.state.start_price,TPAConfigs.moneyFormat)


      	if(activeAuction.settings.automatic_bid) $('.tpa_content .automatic_bid_wrapper').show();
      	else $('.tpa_content .automatic_bid_wrapper').hide();

    	TPAConfigs.state['start_price'] = typeof activeAuction.settings.start_price !== 'undefined' ? activeAuction.settings.start_price : TPAConfigs.settings.def_start_price != '' ? TPAConfigs.settings.def_start_price : typeof TPAConfigs.product.price !== 'undefined' ? TPAConfigs.product.price : 1 ;
//         TPAConfigs.state['next_bid'] = TPAConfigs.state['start_price'];
      	renderChange();

        $('#bid_price').on('change',function(){
            if(isValidPrice($(this).val()*100,getValidPrice(true))){
            	TPAConfigs.state['next_bid'] = ($(this).val())*100;
            }else{
              	TPAConfigs.state['next_bid'] = getValidPrice(true);
            }
            renderChange();
        });

      	$(document).on('click',"#bid",async function(){
          	if(TPAConfigs.customer.email!=''){}
          	else {
              var trans_login_to_bid = TPAConfigs.settings.trans_login_to_bid,anchor = '',code=''
              const regex_replace = /{.*}/;
              var m_replace = regex_replace.exec(TPAConfigs.settings.trans_login_to_bid)

              if(m_replace && m_replace.length){
                	code = m_replace[0]
              		const regex_type = /[^\{]+(?=\|)/g;
                    var m_type = regex_type.exec(TPAConfigs.settings.trans_login_to_bid)

                    const regex_trans = /[^\|]+(?=\})/g;
                    var m_trans = regex_trans.exec(TPAConfigs.settings.trans_login_to_bid)

                    if(m_type[0] == 'login' && m_trans[0] != ''){
                          anchor = '<a href="#" class="login" onclick="gotoLogin(event)">'+m_trans[0]+'</a>'
                          gotoLogin = function (event){
                              event.preventDefault()
                              window.location.href = "/account/login?checkout_url="+window.location.href;
                          }
                    }
              }
              trans_login_to_bid = trans_login_to_bid.replace(code, anchor);
              showMessage(trans_login_to_bid,'warning')
        	}
        });
      	$('.tpa_content .bid-ctrl.minus').click(function(){
            minus();
        });
        $('.tpa_content .bid-ctrl.plus').click(function(){
            plus();
        });
      	if(TPAConfigs.customer.email != ''){
            $('#bid').click(function(){
                var price = parseFloat($(".tpa_content #bid_price").val())*100
                var auction_id = $(".tpa_content").attr('data-auction-id');
              	var auto_bid = $('#automatic_bid').is(':checked');
              	var variant_id = $('select[name="id"]').val();

                var bid_data = {
                    url : TPAConfigs.shop_url,
                    auction_id:auction_id,
					customer_id:TPAConfigs.customer.id,
                    username:TPAConfigs.customer.name ,
                    email : TPAConfigs.customer.email,
                    product_id : TPAConfigs.state.product_id,
                  	product_title:TPAConfigs.product.title,
                    product_handle:TPAConfigs.product.handle,
                    product_price:TPAConfigs.product.price,
                    product_image:TPAConfigs.product.featured_image,
                    price : price,
                    auto_bid:auto_bid,
                  	variant_id:variant_id
                }
                socket.emit('bid', bid_data);
            });
        }
    }
  	
    var socket = io.connect(TPAConfigs.app_host);
  	var room = {
        role : "customer",
        url : TPAConfigs.shop_url,
		p_id: TPAConfigs.state.product_id,
		email : TPAConfigs.customer.email
    }
    socket.on('connect', function() {
        socket.emit('room', room);
    });
  	socket.on('new bid '+room.url+' '+room.p_id, function (data) {
      	var bids = data.data.detail;
      	bindDataToTable(bids);
    	initSingleCountDown(data.data.auction.end_time,$('.tpa_content .clock'),false);
      	TPAConfigs.state['bids'] = bids;
      	autoPlus();
    });
  	socket.on('success bid', function(message) {
        showMessage(message,'success')
    });
  	socket.on('fail bid', function(message) {
        showMessage(message,'warning')
    });
  	socket.on('stop auction '+room.url+' '+room.p_id, function(res) {
      	$('[data-product-id="'+res.p_id+'"]').hide()
        if(res.winner == TPAConfigs.customer.id){
            if(typeof TPAConfigs.settings.trans_stop_auction_winner_message === 'undefined') {
              TPAConfigs.settings.trans_stop_auction_winner_message = 'Congratulation! Your are winner. {checkout|Checkout} now'
            }
            $("#stopAuctionModal .modal__footer .modal__btn-primary").attr('data-id',res.auction_detail_id)
          	$("#stopAuctionModal .modal__footer .modal__btn-primary").show()
        	$("#stopAuctionModal .modal__content").html(replaceLinkCode(TPAConfigs.settings.trans_stop_auction_winner_message,'checkout',{link:'#',id:res.auction_detail_id}))
        }else{
          	$("#stopAuctionModal .modal__footer .modal__btn-primary").hide()
        	$("#stopAuctionModal .modal__content").html(TPAConfigs.settings.trans_stop_auction_loser_message)
        }
        MicroModal.show('stopAuctionModal');

        var evt = new CustomEvent('tipo_auction_stopped', { product_id: res.p_id });
        window.dispatchEvent(evt);

    });
  	//   Account Auction Page
  	let accountSelector = $('body :contains("{tpa-account}")')
    if(accountSelector.length){
    	accountSelector = accountSelector.eq(accountSelector.length-1)
        fetchAccountPage(accountSelector,1)

        // Event go to page
        $(document).on('click','.tpa-account .tpa-paginate .page.auctions',function(){
              fetchAccountPage(accountSelector,$(this).text())
        })
        $(document).off('click').on('click','.tpa-account .view',async function(e){
        	e.preventDefault()
			    e.stopPropagation();
            $("#tpa_modal").toggleClass("-open")
            $("#tpa_modal .modal_inner").empty().append('<div class="lds-ring"><div></div><div></div><div></div><div></div></div>')
            fetchHistoryAuctionDetail($(this).data('id'),1)
            $(document).on('click','.tpa-account .tpa-paginate .page.detail',function(){
              fetchHistoryAuctionDetail($(this).data('id'),$(this).data('page'))
            })
			return false;
        })
    }
	$(document).on('click','#tpa_modal,.tpa-account .modal_inner .close',function(e) {
      if (e.target === this) {
        $(this).toggleClass("-open")
      }else if(e.target.className.indexOf('close') > -1 ){
      	$(this).closest('.modal').toggleClass("-open")
      }
    })
    $(document).on('click','.auction-checkout-button',async function(e){
        e.preventDefault()
        let id = $(this).data('id')
        let checkout = await $.ajax({
            url: "https://"+window.location.host+"/apps/auction/front/account/checkout",
            method : 'GET',
            data : {
                  email : TPAConfigs.customer.email,
                  shop : TPAConfigs.shop_url,
                  id:id
            }
        });
        window.location.href = checkout
    })


  	// Auction Collection
    if(typeof TPACollection !== 'undefined'){
        $('.tpa-collection').each(function(i, obj) {
            let p_id = $(obj).data('id')
            if(p_id&& typeof TPACollection[p_id].metafields !== 'undefined'){
              	let metafields = TPACollection[p_id].metafields
                let start_time = metafields.start_time
                let end_time = metafields.end_time
				        let status = TPAApp.getAuctionStatus(TPACollection[p_id])
                let hideAtc=false,hidePrice=false
              	// Running auctions
                if(status === 1){
                  if(TPAConfigs.settings.show_collection_countdown != '0'){
                  	$(obj).find('.time .label').text(TPAConfigs.settings.trans_end_in);
                    $(obj).find('.end_in').append(end_time)
                    initSingleCountDown(end_time,$(obj).find('.end_in'),true)
                  }
					
                    
                    if(TPAConfigs.settings.hide_atc_when_running === '1'){
                        hideAtc = true
                    }
                    if(TPAConfigs.settings.hide_price_when_running === '1'){
                        hidePrice = true
                    }
                }

                // Pending Auction
                if( status === 2 ){
                  if(TPAConfigs.settings.show_collection_countdown != '0'){
                  	$(obj).find('.time .label').text(TPAConfigs.settings.trans_start_in)
                    $(obj).find('.start_in').append(start_time)
                    initSingleCountDown(start_time,$(obj).find('.start_in'),true)
                  }
                    
                    if(TPAConfigs.settings.hide_atc_when_pending === '1'){
                        hideAtc = true
                    }
                    if(TPAConfigs.settings.hide_price_when_pending === '1'){
                        hidePrice = true
                    }
                }


				// Stop Auction
                if( status === 0 ){
                	if(TPAConfigs.settings.hide_atc_when_stopped === '1'){
                        hideAtc = true
                    }
                    if(TPAConfigs.settings.hide_price_when_stopped === '1'){
                        hidePrice = true
                    }
                }
              
              	if(hideAtc){
                  $(obj).parent().find(TPAConfigs.selector.add_to_cart).hide()
                }
                if(hidePrice){
                  $(obj).parent().find(TPAConfigs.selector.price).hide()
                }
              	
                if(TPAConfigs.settings.show_collection_countdown != '0'){
                  $(obj).find('.flip-clock-divider.days .flip-clock-label').text(TPAConfigs.settings.trans_clock_days);
                  $(obj).find('.flip-clock-divider.hours .flip-clock-label').text(TPAConfigs.settings.trans_clock_hours);
                  $(obj).find('.flip-clock-divider.minutes .flip-clock-label').text(TPAConfigs.settings.trans_clock_minutes);
                  $(obj).find('.flip-clock-divider.seconds .flip-clock-label').text(TPAConfigs.settings.trans_clock_seconds);
                }
              
              	
            }
        });
    }



}

async function fetchAccountPage(selector,page){
    if(TPAConfigs.customer.email!=''){
        let accountData = await $.ajax({
          url: "https://"+window.location.host+"/apps/auction/front/account",
          method : 'GET',
          data : {
                email : TPAConfigs.customer.email,
                shop : TPAConfigs.shop_url,
                page:page
          }
        })
		accountData = JSON.parse(accountData)
      	engine
        .parseAndRender($('#tpa-account').html(), {settings:JSON.parse(accountData.shop.settings),history:accountData.history})
        .then(function(html){
        	selector.empty().append(html)
            if($('.tpa-account').width() == $('body').width()){
            	$('.tpa-account').addClass('is-full-width')
            }
        })
    }
}
async function fetchHistoryAuctionDetail(id,page){
    if(TPAConfigs.customer.email!=''){
        let data = await $.ajax({
          url: "https://"+window.location.host+"/apps/auction/front/account",
          method : 'GET',
          data : {
                email : TPAConfigs.customer.email,
                shop : TPAConfigs.shop_url,
                page:page,
                id:id
          }
        })
		data = JSON.parse(data)
      	engine
        .parseAndRender($('#tpa-history-auction-detail').html(), {auction_id:id,settings:JSON.parse(data.shop.settings),history:data.history,TPAConfigs})
        .then(function(html){
        	$('.tpa-account #tpa_modal .modal_inner').empty().append('<span class="close">x</span>'+html)
        })
    }
}

function getValidPrice(add,current_price){
	let settings = TPAConfigs.state.product.settings;
    let bid_step = typeof settings.bid_step !== 'undefined' ? settings.bid_step : TPAConfigs.settings.def_bid_step != '' ? TPAConfigs.settings.def_bid_step : 1 ;
    var new_price = typeof current_price !== 'undefined' ? current_price : typeof TPAConfigs.state.current_price !== 'undefined' ? TPAConfigs.state.current_price : TPAConfigs.state.start_price ;

  	if( typeof TPAConfigs.state.current_price === 'undefined' ) {
      TPAConfigs.state['current_price'] = TPAConfigs.state.start_price
      return TPAConfigs.state.start_price
    }
  	let isInGap = false;
  	let loop = true;
  	if(settings&&typeof settings.increment_gap !== 'undefined'){
        (settings.increment_gap).forEach(function(rule){
            if(loop&&new_price >= rule.from && new_price < rule.to){
            	isInGap = true;
                if(add){
                    new_price += parseInt(rule.amount);
                }else{
                  	let preAmount = getPreAmount(settings.increment_gap,rule.amount)
                    if(new_price - parseInt(rule.amount) >= rule.from && new_price - parseInt(preAmount) >= rule.from){
                    	new_price -= parseInt(rule.amount);
                    }else{
                    	new_price -= parseInt(preAmount);
                    }
                }
              	loop = false;
            }
        });
    }
  	if(!isInGap){
        if(add)
            new_price += parseInt(bid_step);
        else
            new_price -= parseInt(bid_step);
    }
    return new_price < 0 ? 0: new_price;
}
function isValidPrice(new_price,valid_price){
    return parseInt(new_price) >= parseInt(valid_price) ? true: false;
}
function getPreAmount(increment_gap,amount){
  	let preAmount = 0;
  	let loop = true;
    increment_gap.forEach(function(rule){
        if(loop){
        	if(amount == rule.amount){
                loop= false;
            }else{
                preAmount = rule.amount
            }
        }

    })
    return preAmount;
}
function minus(){
  	var curr = parseFloat($('.tpa_content #bid_price').val())*100
    $('.tpa_content #bid_price').val(getValidPrice(false,curr)/100)
}
function plus(){
    var curr = parseFloat($('.tpa_content #bid_price').val())*100
  	$('.tpa_content #bid_price').val(getValidPrice(true,curr)/100)
}
function autoPlus(){
    if(typeof TPAConfigs.state.bids !== 'undefined'){
      	TPAConfigs.state.current_price = typeof TPAConfigs.state.bids.lastest_bid !== 'undefined' ? TPAConfigs.state.bids.lastest_bid.bid_amount : 0
		TPAConfigs.state.next_bid = getValidPrice(true)
    }

    renderChange();
}
function renderChange(){
    if(TPAConfigs.state){
      	if(typeof TPAConfigs.state.current_price === 'undefined') $('.current_price').hide();
      	else $('.current_price').css('display', 'flex');
        let num_bids = typeof TPAConfigs.state.bids !== 'undefined' ? TPAConfigs.state.bids.count : 0
        let current_price = typeof TPAConfigs.state.bids.lastest_bid !== 'undefined' ? TPAConfigs.state.bids.lastest_bid.bid_amount : TPAConfigs.state.start_price
        let bidder = typeof TPAConfigs.state.bids.lastest_bid !== 'undefined' ? TPAConfigs.state.bids.lastest_bid.username : ''
        let start_price = TPAConfigs.state.start_price
        let reserve_price = TPAConfigs.state.product.settings.reserve_price_enable == "enable" ? TPAConfigs.state.product.settings.reserve_price : 0
        let buyout_price = TPAConfigs.state.product.settings.stopwhenover == "enable" ? TPAConfigs.state.product.settings.stopwhenover_price : 0
        let start_time = toLocalTime(TPAConfigs.state.product.start_time)
        let end_time = toLocalTime(TPAConfigs.state.product.end_time)

        if(num_bids>0){
        	$('.bids').css('display', 'flex').find('.value').html(num_bids);
        }
        if(current_price){
			$('.current_price').css('display', 'flex').find('.money').html(TPAConfigs.formatMoney(current_price,TPAConfigs.moneyFormat));
        }
        if(bidder){
        	$('.bidder').css('display', 'flex').find('.value').html(bidder);
        }
      	$('.start_price').css('display', 'flex').find('.money').html(TPAConfigs.formatMoney(TPAConfigs.state.start_price,TPAConfigs.moneyFormat));
        if(TPAConfigs.state.product.settings.reserve_price_enable == "enable" && TPAConfigs.state.product.settings.reserve_price_display){
        	$('.reserve_price').css('display', 'flex').find('.money').html(TPAConfigs.formatMoney(reserve_price,TPAConfigs.moneyFormat));
        }else{
        	$('.reserve_price').hide()
        }
        if(TPAConfigs.state.product.settings.stopwhenover == "enable" && TPAConfigs.state.product.settings.buyout_price_display){
        	$('.buyout_price').css('display', 'flex').find('.money').html(TPAConfigs.formatMoney(buyout_price,TPAConfigs.moneyFormat));
        }else{
        	$('.buyout_price').hide()
        }

      	$('.start_time').css('display', 'flex').find('.value').html(start_time);
      	$('.end_time').css('display', 'flex').find('.value').html(end_time);

        if(typeof TPAConfigs.state.next_bid !== 'undefined'){
          	$('.tpa_content #bid_price').val(TPAConfigs.state.next_bid/100);
        }
        if(typeof TPAConfigs.state.auto_bid_amount !== 'undefined' && TPAConfigs.state.auto_bid_amount > 0){
          	$('.tpa_content #automatic_bid').prop('checked', true);
          	$('.tpa_content #bid_price').val(TPAConfigs.state.auto_bid_amount/100);
        }
    }
}
TPAApp.getAuctionStatus = function(product){
    if(typeof product === 'undefined' || typeof product.metafields === 'undefined' || (!product.tags.includes('auction') && !product.tags.includes('Auction')) ){
    	return -1; // No auction data before
    }
    var startTime = toLocalTime(product.metafields.start_time)
    var endTime = toLocalTime(product.metafields.end_time)
    var now = toLocalTime(new Date())
    if(now < startTime){
    	return 2; // Pending
    }
    if(endTime < now){
    	return 0; // Stop
    }
    return 1 // Running
}
async function fetchBidHistory(page = 1){
  	let valid = false;
  	if(typeof TPAConfigs.product === 'undefined' || TPAConfigs.product.tags.length < 2 || (TPAConfigs.product.tags.indexOf('auction') == -1 && TPAConfigs.product.tags.indexOf('Auction') == -1) || TPAConfigs.product.tags.indexOf('running') == -1)
      return false;

    if(!TPAConfigs.state.product_id) return false;
  	let a = await fetch(TPAConfigs.app_host+"/api/front/"+TPAConfigs.shop_url+"/"+TPAConfigs.state.product_id+"/auction_detail/"+page)
    .then((res) => res.json())
    .then(async function(res) {
      if(res.active_auction.id>0){
        TPAConfigs.state.product = res.active_auction;
        res.active_auction.settings = JSON.parse(res.active_auction.settings);
        TPAConfigs.state.start_price = res.active_auction.settings.start_price
        valid = res.active_auction;
        TPAConfigs.state['bids'] = []
      	if(res.detail && res.detail.data.length){
          bindDataToTable(res.detail);
          if(TPAConfigs.customer.email){
            // If there was auction and history => contain autobid data
            await fetchAutoBidAmount('https://'+window.location.host+"/apps/auction/api/front/"+TPAConfigs.shop_url+"/"+res.active_auction.id+"/customer/"+TPAConfigs.customer.email);
          }
          var html = '';
          TPAConfigs.state['current_price'] = typeof res.detail.lastest_bid.bid_amount !== 'undefined' ? res.detail.lastest_bid.bid_amount : TPAConfigs.state.start_price;
          TPAConfigs.state['next_bid'] = getValidPrice(true);
          TPAConfigs.state['bids'] = res.detail
          renderChange();
        }else {
          TPAConfigs.state['next_bid'] = getValidPrice(true);
          $(".bid_list tbody").empty().append("<tr><td colspan="+TPAConfigs.settings.bid_history_column.length+">"+TPAConfigs.settings.trans_there_is_no_bid+"</td></tr>");
        }
      }
    }).catch(function() {});
  	return valid;
}
function renderBidRows(username,email,bid_amount,bid_time){
  	var html = '<tr>'
    if(TPAConfigs.settings.bid_history_column.indexOf("username") != -1){
    	html += '<td data-label="Username" class="username_column">'+username+'</td>'
    }
    if(TPAConfigs.settings.bid_history_column.indexOf("email") != -1){
    	html += '<td data-label="Email" class="email_column">'+email+'</td>'
    }
    if(TPAConfigs.settings.bid_history_column.indexOf("bid_amount") != -1){
    	html += '<td data-label="Bid amount" class="bid_amount_column">'+TPAConfigs.formatMoney(bid_amount,TPAConfigs.moneyFormat)+'</td>'
    }
    if(TPAConfigs.settings.bid_history_column.indexOf("bid_time") != -1){
    	html += '<td data-label="Bid time" class="bid_time_column">'+toLocalTime(bid_time)+'</td>'
    }
	return html
}
function bindDataToTable(bids){
  	let html = '';
	Object.keys(bids.data).forEach(function(key) {
        if(TPAConfigs.state['current_price'] < bids.data[key].bid_amount) {TPAConfigs.state['current_price'] = bids.data[key].bid_amount;}
        html += renderBidRows(bids.data[key].username,bids.data[key].email,bids.data[key].bid_amount,bids.data[key].bid_time);
    });
    $(".bid_list tbody").empty().append(html);
  	paginateTable(bids);
}
async function fetchAutoBidAmount(url){
  	const data = await $.ajax(url);
  	TPAConfigs.state['auto_bid_amount'] = data;
}
function showMessage(message,status){
  	$('.tpa_content .action .message').empty()
    $('.tpa_content .action .message').addClass(status)
    $('.tpa_content .action .message').append('<div class="content">'+message+'</div><div class="dismiss"><svg viewBox="0 0 20 20" class="" focusable="false" aria-hidden="true"><path d="M11.414 10l4.293-4.293a.999.999 0 1 0-1.414-1.414L10 8.586 5.707 4.293a.999.999 0 1 0-1.414 1.414L8.586 10l-4.293 4.293a.999.999 0 1 0 1.414 1.414L10 11.414l4.293 4.293a.997.997 0 0 0 1.414 0 .999.999 0 0 0 0-1.414L11.414 10z" fill-rule="evenodd"></path></svg></div>')
    $('.tpa_content .action .message').css('display','flex')
    $('.tpa_content .action .message svg').on('click',function(){
    	$('.tpa_content .action .message').fadeOut('slow')
    })
    //setTimeout(function(){
    //	$('.tpa_content .action .message').fadeOut('slow')
    //}, 2000);

}
function replaceLinkCode(initialStr,code,data){
  	var anchor = '';
    var regex_replace = /{.*}/;
    var m_replace = regex_replace.exec(initialStr)

    if(m_replace && m_replace.length){
          code = m_replace[0]
          const regex_type = /[^\{]+(?=\|)/g;
          var m_type = regex_type.exec(initialStr)

          const regex_trans = /[^\|]+(?=\})/g;
          var m_trans = regex_trans.exec(initialStr)
          if(m_type[0] == 'login' && m_trans[0] != ''){
                anchor = '<a href="#" class="login" onclick="gotoLogin(event)">'+m_trans[0]+'</a>'
                gotoLogin = function (event){
                    event.preventDefault()
                    window.location.href = "/account/login?checkout_url="+window.location.href;
                }
          }
      
      	  if(m_type[0] == 'checkout' && m_trans[0] != ''){
                anchor = '<a href="'+data.link+'" target="_blank" class="auction-checkout-button" data-id="'+data.id+'">'+m_trans[0]+'</a>'
          }
    }
    return initialStr.replace(code, anchor);
}

TPAConfigs.formatMoney = function(cents, format) {
  if (typeof cents == 'string') { cents = cents.replace('.',''); }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || TPAConfigs.moneyFormat);
  function defaultOption(opt, def) {
     return (typeof opt == 'undefined' ? def : opt);
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ',');
    decimal   = defaultOption(decimal, '.');

    if (isNaN(number) || number == null) { return 0; }

    number = (number/100.0).toFixed(precision);

    var parts   = number.split('.'),
        dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands),
        cents   = parts[1] ? (decimal + parts[1]) : '';

    return dollars + cents;
  }
  switch(formatString.match(placeholderRegex)[1]) {
	  case 'amount':
        value = formatWithDelimiters(cents, 2, ',', '.');
        break;
      case 'amount_with_space_separator':
        value = formatWithDelimiters(cents, 2, ' ', '.');
        break;
      case 'amount_with_comma_separator':
        value = formatWithDelimiters(cents, 2, '.', ',');
        break;
      case 'amount_with_apostrophe_separator':
        value = formatWithDelimiters(cents, 2, '\'', '.');
        break;
      case 'amount_no_decimals':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
      case 'amount_no_decimals_with_space_separator':
        value = formatWithDelimiters(cents, 0, ' ', '.');
        break;
      case 'amount_no_decimals_with_comma_separator':
        value = formatWithDelimiters(cents, 0, ',', '.');
        break;
  }

  return formatString.replace(placeholderRegex, value);
}
function paginateTable(bids){
    if(bids.numPage > 1){
    	Pagination.Init($('.tpa_content .pager')[0], {
            size: bids.numPage,
            page: bids.curPage,
            step: 1
        });
        $('.tpa_content .pager .page-number').on('click',function(){
            if($(this).hasClass('active') || $(this).hasClass('disable')) return;
            page = $(this).data('page')
            fetchBidHistory(page)
        })
    }
}
function toLocalTime(datetime){
  	return moment(moment.utc(datetime).toDate()).local().format('YYYY-MM-DD HH:mm')
}

window.TPAmain = TPAmain
window.TPAApp = TPAApp
if(typeof jQuery=='undefined') {
    var headTag = document.getElementsByTagName("head")[0];
    var jqTag = document.createElement('script');
    jqTag.type = 'text/javascript';
    jqTag.src = 'https://code.jquery.com/jquery-1.11.1.js';
    jqTag.onload = TPAmain;
    headTag.appendChild(jqTag);
} else {
     TPAmain();
}