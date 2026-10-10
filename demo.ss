/* StyleScript Example Source */
$bg-color = #0f172a;
$card-bg = #1e293b;
$accent-color = #3b82f6;
$text-color = #f8fafc;

body {
  background-color: $bg-color;
  color: $text-color;
  font-family: system-ui, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}

.card {
  background-color: $card-bg;
  padding: 2.5rem;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.4);

  h1 {
    color: $accent-color;
    margin-top: 0;
    font-size: 1.8rem;
  }

  p {
    color: #94a3b8;
    line-height: 1.5;
  }

  .btn {
    background-color: $accent-color;
    color: #ffffff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }
}
