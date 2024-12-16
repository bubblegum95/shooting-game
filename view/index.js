async function submitSignUpForm() {
  const formData = {
    name: document.getElementById('name').value,
    username: document.getElementById('username').value,
    email: document.getElementById('email').value,
    password: document.getElementById('password').value,
    phone: document.getElementById('phone').value,
  };

  const response = await fetch('http://localhost:3000', {
    method: 'POST',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const result = response.json();

  console.log(result);
}
