const socket = io()

const $chatForm = document.querySelector('#message-form')
const $chatFormInput = $chatForm.querySelector('input')
const $chatFormButton = $chatForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location');
const $msg = document.querySelector('#messages')


const msgTemplate = document.querySelector('#message-template').innerHTML

const locationTemplate = document.querySelector('#location-message-template').innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML


const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMsg =$msg.lastElementChild

    const newMsgStyles = getComputedStyle($newMsg)
    const newMsgMargin = parseInt(newMsgStyles.marginBottom)
    const newMsgHeight = $newMsg.offsetHeight + newMsgMargin

    const visibleHeight = $msg.offsetHeight

    const contentHeight = $msg.scrollHeight

    const scrollOffset = $msg.scrollTop + visibleHeight

    if(contentHeight - newMsgHeight <= scrollOffset) {
        $msg.scrollTop = $msg.scrollHeight
    }

}

socket.on('message',(msg) => {
    console.log( msg)
    const html = Mustache.render(msgTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm A')
    })
    $msg.insertAdjacentHTML('beforeend',html)
    autoscroll();
})

socket.on('locationMsg',(Obj) => {
    console.log( Obj)
    const html = Mustache.render(locationTemplate, {
        username: Obj.username,
        url: Obj.url,
        createdAt: moment(Obj.createdAt).format('h:mm A')
    })
    $msg.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room,users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$chatForm.addEventListener('submit',(e) => {
    e.preventDefault()

    $chatFormButton.setAttribute('disabled', 'disabled')

    const msg = e.target.elements.message.value

    socket.emit('sendMessage', msg, (err) => {
        $chatFormButton.removeAttribute('disabled')
        $chatFormInput.value = '';
        $chatFormInput.focus()
        if(err){
            return console.log(err)
        }
        console.log('Message delivered')
    });
})

$sendLocationButton.addEventListener('click', () => {

    if(!navigator.geolocation){
        return alert(`You are using an old browser that dont support`)
    }

    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) =>{
        socket.emit('sendLocation',position.coords.latitude,position.coords.longitude,(err)=>{
            $sendLocationButton.removeAttribute('disabled')
            $chatFormInput.focus()
            if(err){
                return console.log(err)
            }
            console.log('Location shared')
        })
    })
})

socket.emit('join', {username , room}, (error) => {
    if(error){
        alert(error)
        location.href ='/'
    }
})