import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';

export function toastNotification(message, duration, button) {
  if (!(duration > 0)) duration = 3000;
  return new Promise((resolve) => {
    const id = 'toast-notification-container', animTime = 300;
    let ntfCntr = document.getElementById(id);
    if (!ntfCntr) {
      ntfCntr = document.createElement('div');
      ntfCntr.setAttribute('id', id);
      document.body.appendChild(ntfCntr);
    }
    const container = document.createElement('div');
    container.setAttribute('style', 'position:fixed;visibility:hidden');
    container.setAttribute('count', true);
    ntfCntr.appendChild(container);
    let locked = false;
    const close = (res) => {
      if (locked) return;
      locked = true;
      container.removeAttribute('count');
      container.style.bottom = (-container.offsetHeight) + 'px';
      let node = ntfCntr.firstChild, pos = 0;
      do { 
        if (node.getAttribute('count')) {
          node.style.bottom = pos + 'px';
          pos += node.offsetHeight;
        }
      } while ((node = node.nextSibling));
      setTimeout(() => {
        ReactDOM.unmountComponentAtNode(container);
        ntfCntr.removeChild(container);
        if (!ntfCntr.hasChildNodes()) document.body.removeChild(ntfCntr);
      }, animTime);
      resolve(res === true);
    }
    const dismiss = (e) => {
      if (!e.target.classList.contains('btn')) { e.preventDefault(); close(false); }
    }
    const ToastNotification = () => {
      useEffect(() => {
        container.setAttribute('style', 'position:fixed;transition:bottom '+ animTime +'ms;'+
          'left:0;right:0;bottom:-'+container.offsetHeight+'px;z-index:2147483647');
        let pos = 0, node = container;
        while ((node = node.previousSibling)) 
          if (node.getAttribute('count')) pos += node.offsetHeight;
        setTimeout(() => container.style.bottom = pos + 'px', 50);
        setTimeout(close, duration);
      }, []);
      return (
        <div className="toast-notification" onTouchEnd={dismiss} onMouseUp={dismiss}>
          <div className="toast-notification-msg">{message}</div>
          <div className="toast-notification-btn">
            {button&&<button className="btn" 
              onClick={()=>setTimeout(()=>close(true),10)}>{button}</button>}
          </div>
        </div>
      );
    };
    ReactDOM.render(<ToastNotification/>, container);
  });
}
  
export function confirmDialog(message, buttons) {
  if (buttons === undefined) buttons = ['OK', 'Anuluj'];
  return new Promise((resolve) => {
    const container = document.createElement('div'), animTime = 200;
    document.body.appendChild(container);
    const close = () => setTimeout(() => {
      ReactDOM.unmountComponentAtNode(container);
      if (container.parentNode === document.body) document.body.removeChild(container);
      window.removeEventListener('popstate', onPopstate);
    }, animTime);
    const onPopstate = () => { resolve(false); close(); };
    window.addEventListener('popstate', onPopstate);
    const ConfirmDialog = () => {
      const [opacity, setOpacity] = useState(0);
      useEffect(() => {
        setTimeout(() => setOpacity(1), 50);
      }, []);
      return (
        <div style={{opacity: opacity,
          transition: 'opacity '+ animTime +'ms ease-in',
          position: 'fixed', zIndex: 2147483647, 
          left: 0, top: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)'
        }}>
          <div className="confirm-dialog" style={{
            position: 'absolute', top: '50%', left: '50%', 
            transform: 'translateX(-50%) translateY(-50%)', 
          }}>
            <div className="confirm-dialog-msg">{message}</div>
            <div className="confirm-dialog-btn">
              {buttons[1]&&<button className="btn-cancel" 
                onClick={()=>{setOpacity(0);resolve(false);close();}}>{buttons[1]}</button>}
              {buttons[0]&&<button className="btn-ok" 
                onClick={()=>{setOpacity(0);resolve(true);close();}}>{buttons[0]}</button>}
            </div>
          </div>
        </div>
      );
    };
    ReactDOM.render(<ConfirmDialog/>, container);
  });
}
  
export function selectDialog(optionsList, defIndex) {
  defIndex = defIndex > -1 ? defIndex : -1;
  return new Promise((resolve) => {
    const container = document.createElement('div'), animTime = 200;
    document.body.appendChild(container);
    const close = (delay) => setTimeout(() => {
      ReactDOM.unmountComponentAtNode(container);
      if (container.parentNode === document.body) document.body.removeChild(container);
      window.removeEventListener('popstate', cancel);
    }, delay > 0 ? delay : 0);
    const cancel = () => { resolve(defIndex); close(); };
    window.addEventListener('popstate', cancel);
    const SelectDialog = () => {
      let selDlg;
      const [opacity, setOpacity] = useState(0);
      useEffect(() => {
        setTimeout(() => setOpacity(1), 50);
        if (selDlg) {
          const selected = selDlg.getElementsByClassName('selected')[0];
          if (selected) selected.scrollIntoView({block: "center"});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return (
        <div onClick={(e)=>{if(selDlg&&!selDlg.contains(e.target))cancel()}} 
        style={{opacity: opacity,
          transition: 'opacity '+ animTime +'ms ease-in',
          position: 'fixed', zIndex: 2147483647, 
          left: 0, top: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)'
        }}>
          <div ref={(e)=>selDlg=e} className="select-dialog" 
            style={{
              position: 'absolute', top: '50%', left: '50%', 
              transform: 'translate(-50%, -50%)'
            }}>
            <ul>
              {optionsList.map((item, index) => 
                <li key={index} 
                  className={(index===defIndex)?'selected':undefined} 
                  onClick={()=>setTimeout(()=>{
                    setOpacity(0);resolve(index);close(animTime);
                  },10)}>
                  {item}
                </li>
              )}
            </ul>
          </div>
        </div>
      );
    };
    ReactDOM.render(<SelectDialog/>, container);
  });
}