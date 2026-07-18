%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% Medium Length Professional CV - RESUME CLASS FILE
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\ProvidesClass{resume}[2026/01/21 v1.3 Section-gap-fix]

\LoadClass[10.5pt,letterpaper]{article}

%------------------------------------------------
% Packages
%------------------------------------------------
\usepackage[parfill]{parskip}
\usepackage{array}
\usepackage{ifthen}

\pagestyle{empty}

%------------------------------------------------
% Name and Address
%------------------------------------------------
\def \name#1{\def\@name{#1}}
\def \@name {}

\def \addressSep {$\diamond$}

\let \@addressone \relax
\let \@addresstwo \relax
\let \@addressthree \relax

\def \address #1{
  \@ifundefined{@addresstwo}{
    \def \@addresstwo {#1}
  }{
  \@ifundefined{@addressthree}{
    \def \@addressthree {#1}
  }{
    \def \@addressone {#1}
  }}
}

\def \printaddress #1{
  \begingroup
    \def \\ {\addressSep\ }
    \centerline{#1}
  \endgroup
  \par
}

\def \printname {
  \begingroup
    \hfil{\MakeUppercase{\namesize\bf \@name}}\hfil
    \par\vspace{0.6em}
  \endgroup
}

%------------------------------------------------
% Document Start Hook
%------------------------------------------------
\let\ori@document=\document
\renewcommand{\document}{
  \ori@document
  \printname
  \@ifundefined{@addressone}{}{\printaddress{\@addressone}}
  \@ifundefined{@addresstwo}{}{\printaddress{\@addresstwo}}
  \@ifundefined{@addressthree}{}{\printaddress{\@addressthree}}
}

%------------------------------------------------
% Section Formatting (FIXED: NO EXTRA SPACE AFTER)
%------------------------------------------------
\newenvironment{rSection}[1]{
  \par\vspace{0.4em}
  \noindent\MakeUppercase{\bf #1}
  \par\vspace{0.15em}
  \hrule
  \par\vspace{0.25em}
}{
  % <-- intentionally NO vspace here
}

%------------------------------------------------
% Subsection Formatting (UNCHANGED)
%------------------------------------------------
\newenvironment{rSubsection}[4]{
  {\bf #1} \hfill {#2}
  \ifthenelse{\equal{#3}{}}{}{
    \\
    {\em #3} \hfill {\em #4}
  }
  \par\vspace{0.15em}
  \begin{list}{$\cdot$}{
    \leftmargin=1.2em
  }
  \itemsep -0.35em
}{
  \end{list}
  \par\vspace{0.15em}
}

%------------------------------------------------
% Spacing Controls
%------------------------------------------------
\def\namesize{\huge}
