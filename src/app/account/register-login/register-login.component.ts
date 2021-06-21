import { Component, OnInit, ViewChild, OnChanges } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  FormControl,
  Validators
} from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { MessageService } from '../../messages/message.service';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-register-login',
  templateUrl: './register-login.component.html',
  styleUrls: ['./register-login.component.scss']
})
export class RegisterLoginComponent implements OnInit {
  public loginForm: FormGroup;
  public registerForm: FormGroup;
  public registerErrors: string;

  constructor(
    private authenticationService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.initLoginForm();
    this.initRegisterForm();
  }

  private initLoginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required)
    });
  }

  private initRegisterForm() {
    this.registerForm = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      password: new FormControl(null, Validators.required),
      confirmPassword: new FormControl(null, Validators.required)
    });
  }

  public onRegister() {
    if (this.registerForm.value.password !== this.registerForm.value.confirmPassword) {
      this.registerErrors = '¡Las contraseñas no coinciden!';
      this.registerForm.controls.password.setErrors({ password: true });
      this.registerForm.controls.confirmPassword.setErrors({ confirmPassword: true });
    } else {
      this.authenticationService.emailSignUp(this.registerForm.value.email, this.registerForm.value.password)
      .then(
        () => {
          this.messageService.add('Cuenta creada correctamente. Por favor, inicie sesión con sus nuevas credenciales!');
          this.loginForm.setValue({ email: this.registerForm.value.email, password: ''});
          this.initRegisterForm();
        },
        (error) => {
          this.registerErrors = error.message;
          if (error.code === 'auth/contraseña-débil') {
            this.registerForm.controls.password.setErrors({ password: true });
            this.registerForm.controls.confirmPassword.setErrors({ confirmPassword: true });
          }
          if (error.code === 'auth/correo-electrónico-ya-en-uso') {
            this.registerForm.controls.email.setErrors({ email: true });
          }
        }
      );
    }
  }

  public onLogin() {
    this.authenticationService
      .emailLogin(this.loginForm.value.email, this.loginForm.value.password)
      .then(
        () => {
          this.messageService.add('¡Inicio de sesión correctamente!');
          this.router.navigate(['/home']);
        },
        (error) => {
          if (error.code === 'auth/usuario-no-encontrado') {
            this.loginForm.controls.email.setErrors({ email: true });
          }
          if (error.code === 'auth/contraseña-incorrecta') {
            this.loginForm.controls.password.setErrors({ password: true });
          }
        }
      );
  }
}
