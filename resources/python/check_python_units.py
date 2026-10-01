"""
  Static dimensional consistency checker for Python files

  Essentially a convenience wrapper for the Impunity units library 
  with some additional processing of warnings, logs and errors

  https://github.com/achevrot/impunity

  This script is designed to be an automated guardrail for scientific
  coding assistants, but it can also be used as a standalone tool
  
  Usage:
    python static_units.py source_filepath
  Or:
    python static_units.py source_filepath function_name  

  If function_name is not provided, all top-level functions and class 
  methods in the source file will be checked (independently of one another)

  For each function, the following information will be printed to stdout:

    - Dimensional inconsistencies
    - Missing unit annotations
    - Unrecognised unit strings or unit syntax
    - Any errors arising from the impunity units check

  The units of all function parameters and local variables should be annotated
  in advance using the typing.Annotated object. See the Impunity docs for details:
  https://achevrot.github.io/impunity/annotated.html

"""

from impunity import impunity

from importlib.util import module_from_spec
from importlib.util import spec_from_file_location
from inspect import getmembers, isfunction, isclass

import pint
import argparse
import logging
import sys


def check_units(fcn: function, message_handler: ImpunityMessageHandler):
  """ 
  Checks the units of a single Python function
  Args:
    fcn (function): Annotated function to be checked
  """
  print(f"\nFunction: {fcn.__qualname__}")
  message_handler.start_counter()  # count impunity log messages
  try:
    impunity(fcn, rewrite=False)
  except pint.errors.UndefinedUnitError as e:
    print(f"{e}")
    print("Please replace with a valid unit string")
    print('The following command will list all recognised units: python -c "import pint; print(list(pint.UnitRegistry()))"')
  except pint.errors.DefinitionSyntaxError as e:
    print(f"{e}")
    print(f"Please check the syntax of unit annotations in function: {fcn.__qualname__}")
    print("For compound units, the following operators are allowed: *, /, **, ^, ( )")
  except Exception as e:
    print(f"{type(e).__name__}: {e}")
  else:
    if message_handler.message_count > 0:
      print(f"Please resolve the {message_handler.message_count} problems highlighted above")
    else:
      print("OK")


class ImpunityMessageHandler(logging.StreamHandler):
  """ 
  Handles impunity log messages
  Tracks the number of logging events following start_counter() 
  """
  def start_counter(self):
    self.message_count = 0
  def emit(self, record):
    self.message_count += 1
    """ 'Fallback to dimensionless' messages might be confusing
    It is not clear whether unannotated variables behave as dimensionless """
    print(record.getMessage().replace(" Fallback to dimensionless",""))


def import_module(source_path: str):
    """ boilerplate: imports module from source path """
    module_spec = spec_from_file_location("source_module", source_path)
    source_module = module_from_spec(module_spec)
    sys.modules["source_module"] = source_module
    module_spec.loader.exec_module(source_module)
    return source_module


def get_fcns(module):
  """ lists all top-level functions and class methods in module """
  fcns = [f[1] for f in getmembers(module, isfunction)]
  for c in getmembers(module, isclass):
    fcns += [f[1] for f in getmembers(c[1], isfunction)]
  return fcns


if __name__ == "__main__":

  parser = argparse.ArgumentParser()
  parser.add_argument("source_path", type=str, help="Path to Python source file")
  parser.add_argument("fcn_name", type=str, nargs="?", default=None, help="Name of function")
  args = parser.parse_args()

  print(f"\nExecuting automated dimensional consistency check for {args.source_path} ...")
  source_module = import_module(args.source_path)

  impunity_logger = logging.getLogger("impunity")
  impunity_logger.setLevel(logging.INFO)  # some important warnings are logged as info
  handler = ImpunityMessageHandler()
  impunity_logger.addHandler(handler)

  if args.fcn_name:
    check_units(getattr(source_module, args.fcn_name), handler)
  else:
    for fcn in get_fcns(source_module):
      check_units(fcn, handler)

  print()
