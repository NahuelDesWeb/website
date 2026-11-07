// Si existe la imagen real, la usa; si no, queda el placeholder marcado.
document.querySelectorAll('[data-img]').forEach(el=>{
  const i=new Image();
  i.onload=()=>{el.style.backgroundImage=`url(${el.dataset.img})`;el.classList.add('has-img')};
  i.src=el.dataset.img;
});
