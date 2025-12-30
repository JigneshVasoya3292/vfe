import './index.css';
import { App } from './App';


const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = '';
app.appendChild(App());

