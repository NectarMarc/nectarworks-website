<!DOCTYPE html>
<html lang="{{ page.lang | default: site.lang | default: "en" }}">

  {%- include head.html -%}

  {%- include scripts.html -%}

  
  {%- if page.class -%}
    <body class="{{ page.class }}">
  {%- else -%}
    <body>
  {%- endif -%}


    {%- include header.html -%}

    <main class="page-content" aria-label="Content">
      {{ content }}
    </main>

    {%- include footer.html -%}

    {%- include scripts.html -%}

  </body>

</html>