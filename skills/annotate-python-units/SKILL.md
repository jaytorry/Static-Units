---
name: annotate-python-units
description: Use this skill to annotate Python code with physical units of measurement. This is a prerequisite for static dimensional consistency checks.
---

This skill provides instructions for annotating Python variables with physical units of measurement. The annotation format is designed to facilitate static dimensional consistency checks using tools such as Impunity. You should not use this skill for libraries or tools that verify units of measurement at runtime (such as Pint).


## Instructions

Use the typing.Annotated object to assign physical units to each variable.

The units should be represented as a string literal in quotes:
```
from typing import Annotated
variable_name: Annotated[data_type, "unit"]
```

The units string may contain a single recognised unit, for example:
```
pressure: Annotated[float, "Pa"]
```

Or a combination of units, known as "compound units", that are multiplied, divided or raised to powers:
```
acceleration: Annotated[float, "m/s**2"]
```

The following operators are supported for compound units:
```
*, /, **, ^, ( )
```

Dimensionless quantities should be labelled as "dimensionless":
```
ratio: Annotated[float, "dimensionless"]
```

function parameters and return types use the same annotation format as local variables:
```
def calculate_pressure(density: Annotated[float, "kg/m**3"], 
                       height: Annotated[float, "m"]) -> Annotated[float, "Pa"]
```

## Recognised units

There are hundreds of recognised unit strings.

This includes the base SI units:
```
"m", "meter", "metre"
"s", "second"
"kg", "kilogram"
"A", "ampere"
"K", "kelvin"
"mol", "mole"
"cd", "candela"
```

And these common derived units:
```
"J", "joule"
"W", "watt"
"V", "volt"
"N", "newton"
"Pa", "pascal"
"Hz", "hertz"
"deg", "degree"
"rad", "radian"
"degC", "degree_Celsius"
"degF", "degree_Fahrenheit"
```

Multiple non-SI unit systems are also supported.

If necessary, use this command to obtain a full list of recognised units:
```
python -c "import pint; print(list(pint.UnitRegistry()))"
```

All base and derived units can be prepended with a scale modifier. 
For example:
```
"mm", "millimeter", 
"cm", "centimeter", 
"kJ", "kilojoule"
"GV", "gigavolt", 
"µHz", "microhertz"
```

Common scale modifiers include:
```
"n", "nano"
"µ", "micro"
"m", "milli"
"c", "centi"
"k", "kilo"
"M", "mega"
"G", "giga"
"T", "tera"
```

If necessary, use this command to obtain a full list of scale modifiers:
```
python -c "import pint; print(list(pint.UnitRegistry()._prefixes.keys()))"
```

## How to determine units of measurement

Use the following information to determine the units of each variable:

* Docstrings and comments
* Variable names
* The original task instructions
* Any scientific background knowledge or project information that you have been provided
* Any other relevant information to which you have access

Use the minimum information necessary to confidently determine the units of each variable. If it is not possible to determine the units of a variable with the available information, you should use the most common units for whatever quantity you think the variable represents (taking scale into account). Do not skip the annotation.

**Unit systems:** If the target code has pre-existing unit annotations, which all belong to the same unit system, you should use that system for any further units (unless there is a good reason not to). If there are no pre-existing unit annotations, you should use the SI unit system unless there is a good reason not to.

## Additional notes

You must assign units to all variables that are used in calculations (i.e., all variables that have a mathematical function or operator applied to them). If you think a variable doesn't represent a physical quantity, or represents a dimensionless physical quantity, you should use "dimensionless" as the units string. Do not omit the units or use an empty string.

All unit strings should follow a valid Python datatype in the typing.Annotated object. If a variable already has a standard type hint, you should replace the type hint with typing.Annotated using the same datatype. If there is no existing type hint, you should make an informed guess of the Python datatype. Most variables that appear in scientific calculations will have a numeric type such as float or int.

## Annotated example function

```
from typing import Annotated

def calculate_pressure(density: Annotated[float, "kg/m**3"], 
                       height: Annotated[float, "m"]) -> Annotated[float, "Pa"]:

  gravity: Annotated[float, "m/s**2"] = 9.81
  
  pressure: Annotated[float, "Pa"] = density * gravity * height

  return pressure
```
